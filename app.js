const ENDPOINT = `${API_URL}/api/productos`;

const $ = (id) => document.getElementById(id);
const form = $('form-producto');
const tabla = $('tabla-productos');
const mensaje = $('mensaje');

function mostrarMensaje(texto, tipo = 'ok') {
  mensaje.textContent = texto;
  mensaje.className = tipo;
  mensaje.hidden = false;
  clearTimeout(mostrarMensaje.t);
  mostrarMensaje.t = setTimeout(() => (mensaje.hidden = true), 5000);
}

// Llama al backend y devuelve el JSON (o lanza un error con el mensaje del servidor).
async function api(url, opciones = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    throw new Error('No se pudo conectar con el backend. Si está en Render gratis, espera ~1 min a que despierte y reintenta.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detalle = data.detalles ? `: ${data.detalles.join('. ')}` : '';
    throw new Error(`(${res.status}) ${data.error || 'Error'}${detalle}`);
  }
  return data;
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function pintarTabla(productos) {
  if (!productos.length) {
    tabla.innerHTML = '<tr><td colspan="6" class="vacio">No hay productos</td></tr>';
    return;
  }
  tabla.innerHTML = productos
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${escapar(p.nombre)}</td>
        <td>S/ ${p.precio.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>${new Date(p.fecha_creacion).toLocaleString()}</td>
        <td>
          <div class="acciones">
            <button class="chico" data-editar="${p.id}">Editar</button>
            <button class="chico peligro" data-eliminar="${p.id}">Eliminar</button>
          </div>
        </td>
      </tr>`
    )
    .join('');
}

async function cargarProductos(nombre = '') {
  try {
    const url = nombre ? `${ENDPOINT}?nombre=${encodeURIComponent(nombre)}` : ENDPOINT;
    const productos = await api(url);
    pintarTabla(productos);
    return productos;
  } catch (err) {
    tabla.innerHTML = '<tr><td colspan="6" class="vacio">No se pudieron cargar los productos</td></tr>';
    mostrarMensaje(err.message, 'error');
  }
}

function resetFormulario() {
  form.reset();
  $('producto-id').value = '';
  $('form-titulo').textContent = 'Crear producto';
  $('btn-guardar').textContent = 'Crear';
  $('btn-cancelar').hidden = true;
}

// Crear / actualizar
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('producto-id').value;
  const producto = {
    nombre: $('nombre').value.trim(),
    precio: Number($('precio').value),
    stock: Number($('stock').value),
  };
  try {
    if (id) {
      await api(`${ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(producto) });
      mostrarMensaje(`Producto ${id} actualizado`);
    } else {
      const creado = await api(ENDPOINT, { method: 'POST', body: JSON.stringify(producto) });
      mostrarMensaje(`Producto creado con id ${creado.id}`);
    }
    resetFormulario();
    cargarProductos();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
});

$('btn-cancelar').addEventListener('click', resetFormulario);

// Botones Editar / Eliminar de la tabla
tabla.addEventListener('click', async (e) => {
  const idEditar = e.target.dataset.editar;
  const idEliminar = e.target.dataset.eliminar;

  if (idEditar) {
    try {
      const p = await api(`${ENDPOINT}/${idEditar}`);
      $('producto-id').value = p.id;
      $('nombre').value = p.nombre;
      $('precio').value = p.precio;
      $('stock').value = p.stock;
      $('form-titulo').textContent = `Editar producto #${p.id}`;
      $('btn-guardar').textContent = 'Guardar cambios';
      $('btn-cancelar').hidden = false;
      form.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      mostrarMensaje(err.message, 'error');
    }
  }

  if (idEliminar && confirm(`¿Eliminar el producto ${idEliminar}?`)) {
    try {
      await api(`${ENDPOINT}/${idEliminar}`, { method: 'DELETE' });
      mostrarMensaje(`Producto ${idEliminar} eliminado`);
      cargarProductos();
    } catch (err) {
      mostrarMensaje(err.message, 'error');
    }
  }
});

// Buscar por nombre
$('form-buscar').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = $('buscar-nombre').value.trim();
  const productos = await cargarProductos(nombre);
  if (productos && nombre) mostrarMensaje(`${productos.length} resultado(s) para "${nombre}"`);
});

$('btn-todos').addEventListener('click', () => {
  $('buscar-nombre').value = '';
  cargarProductos();
});

// Consultar por id
$('form-id').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('buscar-id').value.trim();
  if (!id) return;
  try {
    const p = await api(`${ENDPOINT}/${id}`);
    pintarTabla([p]);
    mostrarMensaje(`Producto ${id} encontrado`);
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
});

cargarProductos();
