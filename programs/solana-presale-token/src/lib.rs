use anchor_lang::prelude::*;
use anchor_lang::system_program;

mod utils;

use crate::utils::lamports_to_sol;

declare_id!("AEoUYX3Jdp5fMb4vG9wWxhLYTZESdZU7PJaC6BrkRtM9");

#[program]
pub mod solana_presale_token {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        msg!("Initializing user...");

        let user_state = &mut ctx.accounts.user_state;
        user_state.sol_transferred = 0.0;

        msg!(
            "User State initialized with sol_transferred as 0 at: {:?}",
            ctx.accounts.user_state.key().as_ref()
        );
        Ok(())
    }

    pub fn initialize_central_pda(_ctx: Context<InitializeCentralPDA>) -> Result<()> {
        msg!("Central PDA initialized!");
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

        user_state.sol_transferred += amount_in_sol;

        msg!(
            "Updated user_state - total sol transferred: {}",
            user_state.sol_transferred
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + UserState::INIT_SPACE,
        seeds = [b"presale-user", signer.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserState {
    pub sol_transferred: f64,
}

#[derive(Accounts)]
pub struct InitializeCentralPDA<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8,
        seeds = [b"presale-central"],
        bump
    )]
    pub central_pda: Account<'info, CentralPDA>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct CentralPDA {}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, seeds = [b"presale-central"], bump)]
    pub central_pda: Account<'info, CentralPDA>,

    #[account(mut, seeds = [b"presale-user", signer.key().as_ref()], bump)]
    pub user_state: Account<'info, UserState>,

    pub system_program: Program<'info, System>,
}
