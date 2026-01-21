import { supabase } from './supabase';

// Generate a random 6-digit token
export function generateToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create admin verification token and send email
export async function sendAdminVerificationEmail(userId: string, email: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token in database
        const { error: insertError } = await supabase
            .from('admin_2fa_tokens')
            .insert({
                user_id: userId,
                token,
                expires_at: expiresAt.toISOString(),
                used: false,
            });

        if (insertError) {
            console.error('Error creating admin token:', insertError);
            return { success: false, error: 'Erro ao criar token de verificação' };
        }

        // Send email via Supabase Edge Function or external service
        // For now, we'll use a simple approach - the token will be shown/sent
        // In production, integrate with an email service like Resend, SendGrid, etc.

        console.log(`Admin verification token for ${email}: ${token}`);

        // TODO: Implement email sending
        // Example with Resend:
        // await resend.emails.send({
        //     from: 'Dona Onça <noreply@donaonca.com.br>',
        //     to: email,
        //     subject: 'Confirmação de Acesso Administrativo - Dona Onça',
        //     html: `
        //         <h2>Confirmação de Acesso Administrativo</h2>
        //         <p>Você recebeu permissões de administrador no site Dona Onça.</p>
        //         <p>Seu código de verificação é: <strong>${token}</strong></p>
        //         <p>Este código expira em 24 horas.</p>
        //     `
        // });

        return { success: true, error: null };
    } catch (err) {
        console.error('Error in sendAdminVerificationEmail:', err);
        return { success: false, error: 'Erro ao enviar email de verificação' };
    }
}

// Set user as admin (called by existing admin)
export async function setUserAsAdmin(userId: string, adminEmail: string): Promise<{ success: boolean; error: string | null }> {
    try {
        // Set is_admin to true but admin_verified to false (needs email confirmation)
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                is_admin: true,
                admin_verified: false
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error setting user as admin:', updateError);
            return { success: false, error: 'Erro ao definir usuário como admin' };
        }

        // Get user email
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Erro ao buscar email do usuário' };
        }

        // Send verification email
        const emailResult = await sendAdminVerificationEmail(userId, profile.email);

        if (!emailResult.success) {
            return emailResult;
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Error in setUserAsAdmin:', err);
        return { success: false, error: 'Erro ao definir permissão de admin' };
    }
}

// Revoke admin access
export async function revokeAdminAccess(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                is_admin: false,
                admin_verified: false
            })
            .eq('id', userId);

        if (error) {
            console.error('Error revoking admin access:', error);
            return { success: false, error: 'Erro ao revogar acesso admin' };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Error in revokeAdminAccess:', err);
        return { success: false, error: 'Erro ao revogar permissão' };
    }
}

// Check if user is verified admin
export async function checkAdminStatus(userId: string): Promise<{ isAdmin: boolean; verified: boolean }> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin, admin_verified')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return { isAdmin: false, verified: false };
        }

        return {
            isAdmin: data.is_admin === true,
            verified: data.admin_verified === true
        };
    } catch (err) {
        console.error('Error checking admin status:', err);
        return { isAdmin: false, verified: false };
    }
}
