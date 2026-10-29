// ── Vista de autenticación ─────────────────────────────────────────────────────
function renderAuth(modo = "login") {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <h1>🏠 CasaFácil Pro</h1>
        <p class="sub">Alquileres modernos en Colombia</p>

        <div class="tabs" id="auth-tabs">
          <button class="tab-btn ${modo === "login"    ? "active" : ""}" onclick="renderAuth('login')">Iniciar sesión</button>
          <button class="tab-btn ${modo === "registro" ? "active" : ""}" onclick="renderAuth('registro')">Registrarse</button>
        </div>

        ${modo === "login"       ? formLogin()      : ""}
        ${modo === "registro"    ? formRegistro()   : ""}
        ${modo === "restablecer" ? formRestablecer() : ""}

        ${modo !== "restablecer" ? `<button class="link-btn" onclick="renderAuth('restablecer')">¿Olvidaste tu contraseña?</button>` : ""}
        ${modo === "restablecer" ? `<button class="link-btn" onclick="renderAuth('login')">← Volver al inicio de sesión</button>` : ""}
      </div>
    </div>
  `;
}

function formLogin() {
  return `
    <div id="form-login">
      <div class="form-grupo">
        <label>Email</label>
        <input type="email" id="l-email" placeholder="tu@email.com" onkeydown="if(event.key==='Enter')submitLogin()">
      </div>
      <div class="form-grupo">
        <label>Contraseña</label>
        <input type="password" id="l-pass" placeholder="••••••••" onkeydown="if(event.key==='Enter')submitLogin()">
      </div>
      <p class="form-error" id="l-error"></p>
      <button class="btn-auth" onclick="submitLogin()">Entrar</button>
    </div>
  `;
}

function formRegistro() {
  return `
    <div id="form-registro">
      <div class="form-grupo">
        <label>Nombre completo</label>
        <input type="text" id="r-nombre" placeholder="Tu nombre">
      </div>
      <div class="form-grupo">
        <label>Email</label>
        <input type="email" id="r-email" placeholder="tu@email.com">
      </div>
      <div class="form-grupo">
        <label>Teléfono</label>
        <input type="tel" id="r-tel" placeholder="+57 300 000 0000">
      </div>
      <div class="form-grupo">
        <label>Contraseña</label>
        <input type="password" id="r-pass" placeholder="Mínimo 6 caracteres">
      </div>
      <p class="form-error" id="r-error"></p>
      <p class="form-exito" id="r-exito"></p>
      <button class="btn-auth" onclick="submitRegistro()">Crear cuenta</button>
    </div>
  `;
}

function formRestablecer() {
  return `
    <div id="form-restablecer">
      <p style="font-size:13px;color:#64748b;margin-bottom:16px;text-align:center;">
        Ingresa tu email, el teléfono con el que te registraste y tu nueva contraseña.
      </p>
      <div class="form-grupo">
        <label>Email</label>
        <input type="email" id="rst-email" placeholder="tu@email.com">
      </div>
      <div class="form-grupo">
        <label>Teléfono registrado</label>
        <input type="tel" id="rst-tel" placeholder="+57 300 000 0000">
      </div>
      <div class="form-grupo">
        <label>Nueva contraseña</label>
        <input type="password" id="rst-pass" placeholder="Mínimo 6 caracteres">
      </div>
      <p class="form-error" id="rst-error"></p>
      <p class="form-exito" id="rst-exito"></p>
      <button class="btn-auth" onclick="submitRestablecer()">Restablecer contraseña</button>
    </div>
  `;
}

async function submitLogin() {
  const email    = document.getElementById("l-email").value.trim();
  const password = document.getElementById("l-pass").value;
  const errEl    = document.getElementById("l-error");
  errEl.textContent = "";

  if (!email || !password) { errEl.textContent = "⚠️ Completa todos los campos."; return; }

  const data = await apiPost("/api/auth/login", { email, password });
  if (data.ok) {
    window.usuarioActual = data.usuario;
    routeByRole();
  } else {
    errEl.textContent = "❌ " + data.error;
  }
}

async function submitRegistro() {
  const nombre   = document.getElementById("r-nombre").value.trim();
  const email    = document.getElementById("r-email").value.trim();
  const telefono = document.getElementById("r-tel").value.trim();
  const password = document.getElementById("r-pass").value;
  const errEl    = document.getElementById("r-error");
  const okEl     = document.getElementById("r-exito");
  errEl.textContent = ""; okEl.textContent = "";

  if (!nombre || !email || !telefono || !password) { errEl.textContent = "⚠️ Completa todos los campos."; return; }

  const data = await apiPost("/api/auth/registro", { nombre, email, telefono, password });
  if (data.ok) {
    window.usuarioActual = data.usuario;
    routeByRole();
  } else {
    errEl.textContent = "❌ " + data.error;
  }
}

async function submitRestablecer() {
  const email          = document.getElementById("rst-email").value.trim();
  const telefono       = document.getElementById("rst-tel").value.trim();
  const nuevaPassword  = document.getElementById("rst-pass").value;
  const errEl          = document.getElementById("rst-error");
  const okEl           = document.getElementById("rst-exito");
  errEl.textContent = ""; okEl.textContent = "";

  if (!email || !telefono || !nuevaPassword) { errEl.textContent = "⚠️ Completa todos los campos."; return; }

  const data = await apiPost("/api/auth/restablecer", { email, telefono, nuevaPassword });
  if (data.ok) {
    okEl.textContent = "✅ " + data.mensaje + " Ya puedes iniciar sesión.";
    setTimeout(() => renderAuth("login"), 2000);
  } else {
    errEl.textContent = "❌ " + data.error;
  }
}

async function logout() {
  await apiPost("/api/auth/logout", {});
  window.usuarioActual = null;
  renderAuth("login");
}
