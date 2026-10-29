// ── Dashboard Administrador ───────────────────────────────────────────────────
async function renderDashboardAdmin(contenedor) {
  contenedor.innerHTML += `<div class="dashboard fade-in" id="dash-admin"></div>`;
  const dash = document.getElementById("dash-admin");

  const [stats, propiedades, reservas] = await Promise.all([
    apiGet("/api/stats"),
    apiGet("/api/propiedades"),
    apiGet("/api/reservas/todas")
  ]);

  dash.innerHTML = `
    <h2>Panel de Administración</h2>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${stats.totalProp}</div>
        <div class="stat-label">Propiedades activas</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${stats.totalUsuarios}</div>
        <div class="stat-label">Usuarios registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${stats.totalReservas}</div>
        <div class="stat-label">Reservas totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#f59e0b;">${stats.pendientes}</div>
        <div class="stat-label">Reservas pendientes</div>
      </div>
    </div>

    <!-- Estadísticas administrativas ampliadas -->
    <div class="admin-stats-heading"><div><p class="section-title">Resumen de actividad</p><p class="stats-subtitle">Indicadores generales de CasaFácil Pro</p></div><span class="stats-updated">Actualizado al cargar el panel</span></div>
    <div class="stats-grid stats-grid-secondary">
      <div class="stat-card stat-card-small"><div class="stat-icon">✓</div><div class="stat-num">${stats.confirmadas ?? 0}</div><div class="stat-label">Reservas confirmadas</div></div>
      <div class="stat-card stat-card-small"><div class="stat-icon">♡</div><div class="stat-num">${stats.favoritos ?? 0}</div><div class="stat-label">Favoritos guardados</div></div>
      <div class="stat-card stat-card-small"><div class="stat-icon">★</div><div class="stat-num">${Number(stats.promedioResenas ?? 0).toFixed(1)} <span class="stat-out-of">/ 5</span></div><div class="stat-label">Promedio de reseñas (${stats.totalResenas ?? 0})</div></div>
      <div class="stat-card stat-card-small"><div class="stat-icon">↘</div><div class="stat-num">${stats.canceladas ?? 0}</div><div class="stat-label">Reservas canceladas</div></div>
    </div>
    <div class="stats-panels">
      <section class="stats-panel"><div class="stats-panel-heading"><div><h3>Actividad de los últimos 6 meses</h3><p>Registros nuevos por mes</p></div></div>
        <div class="trend-legend"><span><i class="legend-dot dot-users"></i>Usuarios</span><span><i class="legend-dot dot-properties"></i>Propiedades</span><span><i class="legend-dot dot-bookings"></i>Reservas</span></div>
        <div class="trend-chart">${(stats.ultimosSeisMeses || []).map(m => {
          const max = Math.max(1, ...(stats.ultimosSeisMeses || []).flatMap(x => [x.usuarios, x.propiedades, x.reservas]));
          const h = n => Math.max(n > 0 ? 5 : 0, Math.round(n / max * 100));
          return `<div class="trend-month"><div class="trend-bars"><span class="trend-bar bar-users" style="height:${h(m.usuarios)}%" title="${m.usuarios} usuarios"></span><span class="trend-bar bar-properties" style="height:${h(m.propiedades)}%" title="${m.propiedades} propiedades"></span><span class="trend-bar bar-bookings" style="height:${h(m.reservas)}%" title="${m.reservas} reservas"></span></div><span class="trend-month-label">${esc(m.mes)}</span></div>`;
        }).join("")}</div>
      </section>
      <section class="stats-panel"><div class="stats-panel-heading"><div><h3>Propiedades más guardadas</h3><p>Según los favoritos de los usuarios</p></div></div><div class="ranking-list">
        ${(stats.propiedadesFavoritas || []).length ? stats.propiedadesFavoritas.map((p, i, arr) => {
          const max = Math.max(1, ...arr.map(x => x.total));
          return `<div class="ranking-item"><div class="ranking-line"><span class="ranking-name">${i+1}. ${esc(p.titulo)}</span><strong>${p.total}</strong></div><div class="ranking-track"><span style="width:${Math.round(p.total/max*100)}%"></span></div><small>${esc(p.ciudad)}</small></div>`;
        }).join("") : '<p class="stats-empty">Todavía no hay favoritos registrados.</p>'}
      </div></section>
    </div>
    <section class="stats-panel reviews-ranking-panel"><div class="stats-panel-heading"><div><h3>Mejor valoradas</h3><p>Propiedades con reseñas de usuarios</p></div></div>
      ${(stats.propiedadesResenadas || []).length ? `<div class="top-reviewed-grid">${stats.propiedadesResenadas.map(p => `<article class="review-rank-card"><div class="review-rank-stars">★ <strong>${Number(p.promedio).toFixed(1)}</strong><span>/ 5</span></div><h4>${esc(p.titulo)}</h4><p>${esc(p.ciudad)}</p><small>${p.total} ${p.total === 1 ? 'reseña' : 'reseñas'}</small></article>`).join("")}</div>` : '<p class="stats-empty">Aún no hay reseñas para calcular el ranking.</p>'}
    </section>

    <!-- Propiedades por ciudad -->
    <p class="section-title">Propiedades por ciudad</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;">
      ${stats.porCiudad.map(c => `
        <span style="background:#eff6ff;color:#1e40af;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:bold;">
          📍 ${c.ciudad} (${c.total})
        </span>
      `).join("")}
    </div>

    <!-- Formulario nueva/editar propiedad -->
    <div class="prop-form" id="prop-form-wrap">
      <h3 id="prop-form-title">➕ Nueva propiedad</h3>
      <input type="hidden" id="edit-id">
      <div class="form-grid">
        <div class="form-grupo">
          <label>Título *</label>
          <input type="text" id="p-titulo" placeholder="Ej: Apartamento en Bogotá">
        </div>
        <div class="form-grupo">
          <label>Ciudad *</label>
          <input type="text" id="p-ciudad" placeholder="Ej: Bogotá">
        </div>
        <div class="form-grupo">
          <label>Precio mensual *</label>
          <input type="number" id="p-precio" placeholder="1200000" step="50000">
        </div>
        <div class="form-grupo">
          <label>Contacto</label>
          <input type="text" id="p-contacto" placeholder="+57 300 000 0000">
        </div>
        <div class="form-grupo">
          <label>Tipo de inmueble</label>
          <select id="p-tipo" style="padding:9px 12px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:14px;">
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="estudio">Estudio</option>
            <option value="local">Local</option>
            <option value="finca">Finca</option>
          </select>
        </div>
        <div class="form-grupo">
          <label>Habitaciones</label>
          <input type="number" id="p-hab" placeholder="2" min="0" value="1">
        </div>
        <div class="form-grupo">
          <label>Baños</label>
          <input type="number" id="p-ban" placeholder="1" min="0" value="1">
        </div>
        <div class="form-grupo">
          <label>Metros cuadrados</label>
          <input type="number" id="p-metros" placeholder="65" min="0">
        </div>
        <div class="form-grupo full">
          <label>Dirección</label>
          <input type="text" id="p-dir" placeholder="Calle 85 #15-20">
        </div>
        <div class="form-grupo full">
          <label>Imágenes (desde tu dispositivo)</label>
          <div class="upload-area" onclick="document.getElementById('p-imgs').click()">
            <input type="file" id="p-imgs" multiple accept="image/*" onchange="previsualizarImgs(this)">
            <div style="font-size:28px;">📷</div>
            <p>Haz clic o arrastra imágenes aquí<br><span style="font-size:11px;">JPG, PNG, WEBP — máx. 8 MB c/u</span></p>
          </div>
          <div id="img-preview" class="thumb-list"></div>
          <div id="img-existentes" class="thumb-list" style="margin-top:8px;"></div>
        </div>
        <div class="form-grupo full">
          <label>Descripción</label>
          <textarea id="p-descripcion" rows="2" placeholder="Descripción breve de la propiedad..."></textarea>
        </div>
      </div>
      <p class="form-error" id="prop-error"></p>
      <p class="form-exito" id="prop-exito"></p>
      <button class="btn-guardar" onclick="guardarPropiedad()">Guardar propiedad</button>
      <button class="btn-cancelar-form" id="btn-cancelar-edit" style="display:none;" onclick="cancelarEdicion()">Cancelar edición</button>
    </div>

    <!-- Lista propiedades admin -->
    <p class="section-title">Propiedades (${propiedades.length})</p>
    <div class="table-wrap" style="margin-bottom:28px;">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Título</th><th>Ciudad</th><th>Precio</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-props">
          ${propiedades.map(p => `
            <tr id="prop-row-${p.id}">
              <td>${p.id}</td>
              <td>${p.titulo}</td>
              <td>${p.ciudad}</td>
              <td>$${Number(p.precio).toLocaleString()}</td>
              <td>
                <button class="btn btn-warning" style="padding:5px 10px;font-size:12px;" onclick="editarPropAdmin(${p.id})">✏️ Editar</button>
                <button class="btn btn-danger"  style="padding:5px 10px;font-size:12px;margin-left:4px;" onclick="eliminarPropAdmin(${p.id})">🗑️ Eliminar</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <!-- Reservas -->
    <p class="section-title">Todas las reservas (${reservas.length})</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Propiedad</th><th>Usuario</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody id="tabla-reservas">
          ${reservas.map(r => `
            <tr id="res-row-${r.id}">
              <td>${r.id}</td>
              <td>${esc(r.propiedad_titulo)}</td>
              <td>${esc(r.usuario_nombre)}<br><small style="color:#94a3b8;">${esc(r.usuario_email)}</small></td>
              <td>${formatFecha(r.fecha)}</td>
              <td>${r.hora}</td>
              <td><span class="badge badge-${r.estado}">${r.estado}</span></td>
              <td>
                ${r.estado === "pendiente" ? `
                  <button class="btn btn-success" style="padding:4px 9px;font-size:12px;" onclick="cambiarEstadoRes(${r.id},'confirmada')">✔ Confirmar</button>
                ` : ""}
                ${r.estado !== "cancelada" ? `
                  <button class="btn btn-danger" style="padding:4px 9px;font-size:12px;margin-left:4px;" onclick="cambiarEstadoRes(${r.id},'cancelada')">✖ Cancelar</button>
                ` : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function guardarPropiedad() {
  const id          = document.getElementById("edit-id").value;
  const titulo      = document.getElementById("p-titulo").value.trim();
  const ciudad      = document.getElementById("p-ciudad").value.trim();
  const precio      = document.getElementById("p-precio").value.trim();
  const contacto    = document.getElementById("p-contacto").value.trim();
  const descripcion = document.getElementById("p-descripcion").value.trim();
  const errEl       = document.getElementById("prop-error");
  const okEl        = document.getElementById("prop-exito");
  errEl.textContent = ""; okEl.textContent = "";

  if (!titulo || !ciudad || !precio) {
    errEl.textContent = "⚠️ Título, ciudad y precio son obligatorios."; return;
  }

  const tipo    = document.getElementById("p-tipo")?.value || "apartamento";
  const hab     = document.getElementById("p-hab")?.value || "1";
  const ban     = document.getElementById("p-ban")?.value || "1";
  const metros  = document.getElementById("p-metros")?.value || "0";
  const dir     = document.getElementById("p-dir")?.value.trim() || "";
  const body = { titulo, ciudad, precio, contacto, descripcion, imagen: "", tipo, habitaciones: hab, banos: ban, metros, direccion: dir };
  const data = id
    ? await apiPut(`/api/propiedades/${id}`, body)
    : await apiPost("/api/propiedades", body);

  if (!data.ok) { errEl.textContent = "❌ " + data.error; return; }

  // Subir imágenes si hay archivos seleccionados
  const archivos = document.getElementById("p-imgs").files;
  if (archivos.length > 0) {
    // Obtener el id de la propiedad recién creada
    let propId = id;
    if (!propId) {
      const props = await apiGet("/api/propiedades");
      propId = props[0]?.id;
    }
    if (propId) {
      const formData = new FormData();
      for (const f of archivos) formData.append("imagenes", f);
      await fetch(`/api/propiedades/${propId}/imagenes`, {
        method: "POST", credentials: "include", body: formData
      });
      // Limpiar cache
      delete imgCache[propId];
    }
  }

  okEl.textContent = "✅ " + data.mensaje;
  limpiarFormProp();
  setTimeout(() => {
    const main = document.getElementById("dash-admin")?.parentElement;
    if (main) { main.innerHTML = ""; renderDashboardAdmin(main); }
  }, 900);
}

async function editarPropAdmin(id) {
  const p = await apiGet(`/api/propiedades/${id}`);
  document.getElementById("edit-id").value        = p.id;
  document.getElementById("p-titulo").value       = p.titulo;
  document.getElementById("p-ciudad").value       = p.ciudad;
  document.getElementById("p-precio").value       = p.precio;
  document.getElementById("p-contacto").value     = p.contacto;
  document.getElementById("p-descripcion").value  = p.descripcion || "";
  if (document.getElementById("p-tipo"))    document.getElementById("p-tipo").value   = p.tipo || "apartamento";
  if (document.getElementById("p-hab"))     document.getElementById("p-hab").value    = p.habitaciones || 1;
  if (document.getElementById("p-ban"))     document.getElementById("p-ban").value    = p.banos || 1;
  if (document.getElementById("p-metros"))  document.getElementById("p-metros").value = p.metros || 0;
  if (document.getElementById("p-dir"))     document.getElementById("p-dir").value    = p.direccion || "";
  document.getElementById("prop-form-title").textContent = "✏️ Editando propiedad #" + id;
  document.getElementById("btn-cancelar-edit").style.display = "inline-block";

  // Mostrar imágenes existentes
  const imgs = await apiGet(`/api/propiedades/${id}/imagenes`);
  const existEl = document.getElementById("img-existentes");
  if (existEl) {
    existEl.innerHTML = imgs.map(img => `
      <div class="thumb-item">
        <img src="${img.url}" alt="">
        <button class="thumb-del" onclick="eliminarImgAdmin(${img.id})" title="Eliminar">×</button>
      </div>
    `).join("");
  }

  document.getElementById("prop-form-wrap").scrollIntoView({ behavior: "smooth" });
}

async function eliminarImgAdmin(imgId) {
  if (!confirm("¿Eliminar esta imagen?")) return;
  await apiDelete(`/api/imagenes/${imgId}`);
  // Refrescar miniaturas
  const editId = document.getElementById("edit-id").value;
  if (editId) {
    delete imgCache[editId];
    editarPropAdmin(editId);
  }
}

function cancelarEdicion() {
  limpiarFormProp();
}

function limpiarFormProp() {
  ["edit-id","p-titulo","p-ciudad","p-precio","p-contacto","p-descripcion","p-hab","p-ban","p-metros","p-dir"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  const imgs = document.getElementById("p-imgs"); if (imgs) imgs.value = "";
  const prev = document.getElementById("img-preview"); if (prev) prev.innerHTML = "";
  const exist = document.getElementById("img-existentes"); if (exist) exist.innerHTML = "";
  document.getElementById("prop-form-title").textContent = "➕ Nueva propiedad";
  document.getElementById("btn-cancelar-edit").style.display = "none";
  document.getElementById("prop-error").textContent = "";
  document.getElementById("prop-exito").textContent = "";
}

async function eliminarPropAdmin(id) {
  if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) return;
  const data = await apiDelete(`/api/propiedades/${id}`);
  if (data.ok) {
    document.getElementById(`prop-row-${id}`)?.remove();
  }
}

async function cambiarEstadoRes(id, estado) {
  const data = await apiPut(`/api/reservas/${id}/estado`, { estado });
  if (data.ok) {
    const row = document.getElementById(`res-row-${id}`);
    if (row) {
      row.querySelector(".badge").className = `badge badge-${estado}`;
      row.querySelector(".badge").textContent = estado;
      row.querySelectorAll("button").forEach(b => b.remove());
    }
  }
}

// ── Previsualizar imágenes seleccionadas ──────────────────────────────────────
function previsualizarImgs(input) {
  const prev = document.getElementById("img-preview");
  if (!prev) return;
  prev.innerHTML = "";
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      prev.innerHTML += `
        <div class="thumb-item">
          <img src="${e.target.result}" alt="${file.name}">
        </div>`;
    };
    reader.readAsDataURL(file);
  });
}
