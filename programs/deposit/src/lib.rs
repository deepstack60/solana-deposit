use anchor_lang::prelude::*;

declare_id!("FHLbDCQYZDNe8aw2xrXR4FMQ53e1NF4RQWdzHVhD3Jd7");

#[program]
pub mod deposit {
    use anchor_lang::prelude::program::invoke;

    use super::*;

    pub fn init_vault(ctx:Context<InitVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.user.key();
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        let ix = system_instruction::transfer(&ctx.accounts.user.key(), &vault.key(), amount);

        invoke(&ix, 
            &[ctx.accounts.user.to_account_info(),
        ctx.accounts.vault.to_account_info()])?;


        Ok(())
    }
}

#[derive(Accounts)]

pub struct InitVault <'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init, payer = user, space = 8 + 40, seeds = [b"vault", user.key().as_ref()], bump)]  
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub bump: u8,
}
