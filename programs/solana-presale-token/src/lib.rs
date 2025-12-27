use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked};

mod utils;

use crate::utils::{lamports_to_sol, LAMPORTS_PER_SOL};

declare_id!("HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ");

#[program]
pub mod solana_presale_token {
    use anchor_spl::token_interface;

    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        msg!("Initializing user...");

        let user_state = &mut ctx.accounts.user_state;
        user_state.user_pubkey = *ctx.accounts.signer.key;
        user_state.sol_transferred = 0;
        user_state.is_distributed = false;

        msg!(
            "User State initialized with sol_transferred as 0 at: {:?}",
            ctx.accounts.user_state.key()
        );
        Ok(())
    }

    pub fn initialize_central_pda(ctx: Context<InitializeCentralPDA>) -> Result<()> {
        msg!("Central PDA initialized!");

        ctx.accounts.central_pda.is_distributable = false;

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let signer = &ctx.accounts.signer;
        let central_pda = &ctx.accounts.central_pda;
        let user_state = &mut ctx.accounts.user_state;

        let amount_in_sol = lamports_to_sol(amount);

        msg!("Transferring {} SOL to Central PDA...", amount_in_sol);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: signer.to_account_info(),
                    to: central_pda.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!(
            "Successfully transferred {} SOL to Central PDA!",
            amount_in_sol
        );

        user_state.sol_transferred += amount;
        user_state.is_distributed = false;

        msg!(
            "Updated user_state - total sol transferred: {}",
            user_state.sol_transferred
        );

        Ok(())
    }

    pub fn enable_distribution(ctx: Context<EnableDistribution>) -> Result<()> {
        msg!("Enabling distribution for the central PDA...");

        // if the pubkey of signer is the same as our pubkey, only then allow otherwise throw an error.

        let central_pda = &mut ctx.accounts.central_pda;
        central_pda.is_distributable = true;

        msg!("Distribution has been enabled.");
        Ok(())
    }

    pub fn distribute(ctx: Context<Distribute>) -> Result<()> {

        let mint = &ctx.accounts.mint;
        let central_pda = &ctx.accounts.central_pda;
        let user_state = &mut ctx.accounts.user_state;
        let user_token_account = &ctx.accounts.user_token_account;
        let pda_token_account = &ctx.accounts.pda_token_account;
        let decimals = mint.decimals;

        // check if we can distribute the tokens from central PDA now
        require!(central_pda.is_distributable, PresaleError::DistributionNotEnabled);

        // check if the user already received the tokens
        require!(!user_state.is_distributed, PresaleError::AlreadyDistributed);


        let sol_lamports = user_state.sol_transferred;

        msg!("Lamports - {} ", sol_lamports);

        let token_amount: u64 = sol_lamports
            .checked_mul(10u64.pow(decimals as u32))
            .ok_or(PresaleError::MathOverflow)?
            .checked_div(10)
            .ok_or(PresaleError::MathOverflow)?
            .checked_div(LAMPORTS_PER_SOL)
            .ok_or(PresaleError::MathOverflow)?;

        msg!("Token amount - {}", token_amount);

        let cpi_accounts = TransferChecked {
            mint: mint.to_account_info(),
            from: pda_token_account.to_account_info(),
            to: user_token_account.to_account_info(),
            authority: central_pda.to_account_info(),
        };

        let signer_seeds: &[&[&[u8]]] = &[&[b"presale-central-latest-v2", &[ctx.bumps.central_pda]]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::transfer_checked(cpi_context, token_amount as u64, decimals)?;

        // // is_distributed will be set to true
        user_state.is_distributed = true;

        msg!("Transferred {} tokens to user", token_amount);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Distribute<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut, seeds = [b"presale-central-latest-v2"], bump)]
    pub central_pda: Account<'info, CentralPDA>,

    #[account(mut)]
    pub pda_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, seeds = [b"presale-user-latest-v2", signer.key().as_ref()], bump)]
    pub user_state: Account<'info, UserState>,

    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EnableDistribution<'info> {
    #[account(mut, address = Pubkey::from_str_const("FSLqVntn9GbWGvd1WBvWS3aKQY8U8nvmbbBNffRDXnHD"))]
    pub signer: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"presale-central-latest-v2"], 
        bump
    )]
    pub central_pda: Account<'info, CentralPDA>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        space = 8 + UserState::INIT_SPACE,
        seeds = [b"presale-user-latest-v2", signer.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserState {
    pub user_pubkey: Pubkey,
    pub sol_transferred: u64,
    pub is_distributed: bool,
}

#[derive(Accounts)]
pub struct InitializeCentralPDA<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        space = 8 + CentralPDA::INIT_SPACE,
        seeds = [b"presale-central-latest-v2"],
        bump
    )]
    pub central_pda: Account<'info, CentralPDA>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = central_pda,
        associated_token::token_program = token_program
    )]
    pub pda_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct CentralPDA {
    pub is_distributable: bool,
}

//next step would be - whenever I consume an event, put it into DB and emit using websocket

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, seeds = [b"presale-central-latest-v2"], bump)]
    pub central_pda: Account<'info, CentralPDA>,

    #[account(mut, seeds = [b"presale-user-latest-v2", signer.key().as_ref()], bump)]
    pub user_state: Account<'info, UserState>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum PresaleError {
    #[msg("Token distribution is not enabled yet")]
    DistributionNotEnabled,

    #[msg("Tokens have already been distributed to this user")]
    AlreadyDistributed,

    #[msg("Some error with the token amount")]
    MathOverflow
}