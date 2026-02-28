# GitHub user:email scope for Pipette

The Pipette faucet uses verified-email status from GitHub to improve anti-sybil scoring. To access verified emails, the app requests the `user:email` OAuth scope when users link GitHub.

## How it works

1. **In the app**: When a user clicks "Connect GitHub", the OAuth redirect URL includes `scopes=user:email`. This is already set in `app/faucet/page.tsx`.

2. **On GitHub**: GitHub shows an authorization screen that lists the requested scopes. Users must approve `user:email` for Pipette to read their verified email addresses (via `/user/emails`).

3. **Supabase**: Supabase does not expose a "scopes" field in the Dashboard for GitHub. The scopes are passed in the authorize URL when the app initiates the OAuth flow. No Supabase Dashboard change is needed.

## If users still get 0 for verified email

1. **Reconnect GitHub**: Users who linked GitHub before we added `user:email` must disconnect and reconnect. The new authorization will request the scope.

2. **GitHub OAuth App**: Ensure your GitHub OAuth App is correctly configured in [GitHub Developer Settings](https://github.com/settings/developers):
   - Callback URL must match Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`
   - The app itself does not have a "requested scopes" setting; scopes come from the authorize URL.

3. **Privacy**: Some users set their email to private on GitHub. Even with `user:email`, if they have no verified email visible, the score will be 0.

## Summary

- **You don't need to change anything in Supabase**. The app passes `scopes=user:email` in the authorize URL.
- **Existing users**: Ask them to disconnect and reconnect GitHub so the new scope is requested.
- **New users**: They will automatically see the scope request when they first connect.
