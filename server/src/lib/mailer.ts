import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function enviarEmailConvite(
  email: string,
  nome: string,
  equipeNome: string,
  tokenAtivacao: string,
  frontendUrl: string = process.env.FRONTEND_URL || "http://localhost:5173"
) {
  const linkAtivacao = `${frontendUrl}/ativar/${tokenAtivacao}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #5f5bff 0%, #6c2bd9 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #5f5bff 0%, #6c2bd9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FlowSense</h1>
          <p>Você foi convidado para uma equipe!</p>
        </div>
        <div class="content">
          <p>Olá ${nome},</p>
          <p>Você foi convidado para se juntar à equipe <strong>${equipeNome}</strong> no FlowSense!</p>
          <p>Para ativar sua conta e começar a colaborar, clique no botão abaixo:</p>
          <div style="text-align: center;">
            <a href="${linkAtivacao}" class="button">Ativar Conta</a>
          </div>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">
            ${linkAtivacao}
          </p>
          <p>Este link expira em 7 dias.</p>
          <p>Se você não foi convidado ou não espera este email, apenas ignore-o.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 FlowSense. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@flowsense.com",
      to: email,
      subject: `Convite para a equipe ${equipeNome} - FlowSense`,
      html: htmlBody,
    });

    console.log(`✅ Email enviado para ${email}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error);
    throw error;
  }
}
