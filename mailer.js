const nodemailer = require("nodemailer");

// ── Configuración ──────────────────────────────────────────────────────────────
// En producción usa variables de entorno: process.env.MAIL_USER, etc.
// Para desarrollo usa Ethereal (correos falsos capturados en línea).
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Crear cuenta Ethereal automáticamente para pruebas
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });

  console.log("📧 Ethereal mail listo → https://ethereal.email/messages");
  console.log(`   Usuario: ${testAccount.user}`);
  return transporter;
}

// ── Plantilla base HTML ────────────────────────────────────────────────────────
function template(titulo, contenido) {
  return `
  <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f5f7fb;margin:0;padding:20px;}
    .card{background:white;max-width:560px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);}
    .header{background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 24px;color:white;}
    .header h1{margin:0;font-size:22px;}
    .header p{margin:6px 0 0;opacity:.85;font-size:14px;}
    .body{padding:24px;}
    .body p{color:#334155;line-height:1.7;font-size:15px;margin:0 0 12px;}
    .highlight{background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;}
    .highlight p{margin:4px 0;font-size:14px;color:#1e40af;}
    .btn{display:inline-block;background:linear-gradient(135deg,#3b82f6,#1e40af);color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:15px;margin-top:8px;}
    .footer{background:#f8fafc;padding:16px 24px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;}
  </style></head><body>
  <div class="card">
    <div class="header">
      <h1>🏠 CasaFácil Pro</h1>
      <p>${titulo}</p>
    </div>
    <div class="body">${contenido}</div>
    <div class="footer">Este es un mensaje automático de CasaFácil Pro. Por favor no respondas este correo.</div>
  </div></body></html>`;
}

// ── Enviar email ───────────────────────────────────────────────────────────────
async function send({ to, subject, html }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({ from: '"CasaFácil Pro" <noreply@casafacil.com>', to, subject, html });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧 Email enviado → ${preview}`);
    return true;
  } catch (err) {
    console.error("❌ Error email:", err.message);
    return false;
  }
}

// ── Plantillas específicas ─────────────────────────────────────────────────────

// Confirmación de reserva para el usuario
async function reservaConfirmadaUsuario({ email, nombre, propiedad, fecha, hora, nota }) {
  const html = template("Visita agendada", `
    <p>Hola <strong>${nombre}</strong>, tu visita ha sido agendada exitosamente. 🎉</p>
    <div class="highlight">
      <p><strong>🏠 Propiedad:</strong> ${propiedad}</p>
      <p><strong>📅 Fecha:</strong> ${fecha}</p>
      <p><strong>🕐 Hora:</strong> ${hora}</p>
      ${nota ? `<p><strong>📝 Nota:</strong> ${nota}</p>` : ""}
    </div>
    <p>Recibirás una confirmación del agente pronto. Si necesitas cancelar, puedes hacerlo desde tu perfil.</p>
  `);
  return send({ to: email, subject: `✅ Visita agendada — ${propiedad}`, html });
}

// Aviso al admin cuando llega una reserva
async function reservaNuevaAdmin({ emailAdmin, usuario, email, propiedad, fecha, hora, nota }) {
  const html = template("Nueva reserva de visita", `
    <p>Se ha recibido una nueva solicitud de visita.</p>
    <div class="highlight">
      <p><strong>👤 Usuario:</strong> ${usuario} (${email})</p>
      <p><strong>🏠 Propiedad:</strong> ${propiedad}</p>
      <p><strong>📅 Fecha:</strong> ${fecha}</p>
      <p><strong>🕐 Hora:</strong> ${hora}</p>
      ${nota ? `<p><strong>📝 Nota:</strong> ${nota}</p>` : ""}
    </div>
    <p>Ingresa al panel de administración para confirmar o cancelar la visita.</p>
  `);
  return send({ to: emailAdmin, subject: `📅 Nueva reserva — ${propiedad}`, html });
}

// Cambio de estado de reserva
async function reservaEstadoCambiado({ email, nombre, propiedad, fecha, hora, estado }) {
  const icon  = estado === "confirmada" ? "✅" : "❌";
  const texto = estado === "confirmada"
    ? "Tu visita ha sido <strong>confirmada</strong> por el agente. ¡Te esperamos!"
    : "Tu visita ha sido <strong>cancelada</strong>. Puedes agendar una nueva fecha desde la plataforma.";

  const html = template(`Reserva ${estado}`, `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>${texto}</p>
    <div class="highlight">
      <p><strong>🏠 Propiedad:</strong> ${propiedad}</p>
      <p><strong>📅 Fecha:</strong> ${fecha}</p>
      <p><strong>🕐 Hora:</strong> ${hora}</p>
    </div>
  `);
  return send({ to: email, subject: `${icon} Reserva ${estado} — ${propiedad}`, html });
}

// Bienvenida al registrarse
async function bienvenida({ email, nombre }) {
  const html = template("Bienvenido a CasaFácil Pro", `
    <p>Hola <strong>${nombre}</strong>, ¡bienvenido a CasaFácil Pro! 🏠</p>
    <p>Ya puedes explorar nuestro catálogo de propiedades, agendar visitas y guardar tus favoritos.</p>
    <p>Si tienes alguna duda, escríbenos en cualquier momento.</p>
  `);
  return send({ to: email, subject: "🏠 Bienvenido a CasaFácil Pro", html });
}

module.exports = { reservaConfirmadaUsuario, reservaNuevaAdmin, reservaEstadoCambiado, bienvenida };
