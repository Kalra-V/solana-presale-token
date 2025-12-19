use anchor_lang::prelude::*;

declare_id!("AEoUYX3Jdp5fMb4vG9wWxhLYTZESdZU7PJaC6BrkRtM9");

#[program]
pub mod solana_presale_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
