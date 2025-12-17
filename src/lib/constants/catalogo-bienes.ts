/**
 * Catálogo exhaustivo de bienes empeñables
 * Usado para fuzzy search en lugar de campos "Otro"
 */

export interface ItemCatalogo {
    id: string
    nombre: string
    categoria: string
    subcategoriaSistema?: string // Mapeo a value de subcategoría del sistema
    keywords: string[]  // Palabras clave para mejorar búsqueda
}

export const CATALOGO_BIENES: ItemCatalogo[] = [
    // === ELECTRÓNICA ===
    { id: 'elec-smartphone', nombre: 'Smartphone / Celular', categoria: 'Electrónica', subcategoriaSistema: 'celular', keywords: ['telefono', 'iphone', 'samsung', 'xiaomi', 'huawei', 'android'] },
    { id: 'elec-tablet', nombre: 'Tablet', categoria: 'Electrónica', subcategoriaSistema: 'tablet', keywords: ['ipad', 'samsung tab', 'lenovo'] },
    { id: 'elec-laptop', nombre: 'Laptop / Notebook', categoria: 'Electrónica', subcategoriaSistema: 'laptop', keywords: ['portatil', 'computadora', 'hp', 'dell', 'lenovo', 'asus', 'macbook'] },
    { id: 'elec-pc-desktop', nombre: 'PC de Escritorio', categoria: 'Electrónica', subcategoriaSistema: 'pc_escritorio', keywords: ['computadora', 'torre', 'desktop'] },
    { id: 'elec-monitor', nombre: 'Monitor', categoria: 'Electrónica', subcategoriaSistema: 'pc_escritorio', keywords: ['pantalla', 'lg', 'samsung', 'asus'] },
    { id: 'elec-impresora', nombre: 'Impresora', categoria: 'Electrónica', subcategoriaSistema: 'pc_escritorio', keywords: ['printer', 'epson', 'hp', 'canon'] },
    { id: 'elec-proyector', nombre: 'Proyector', categoria: 'Electrónica', subcategoriaSistema: 'proyector', keywords: ['epson', 'benq', 'viewsonic'] },
    { id: 'elec-tv', nombre: 'Televisor Smart TV', categoria: 'Electrónica', subcategoriaSistema: 'tv', keywords: ['television', 'lg', 'samsung', 'sony', 'tcl'] },
    { id: 'elec-consola', nombre: 'Consola de Videojuegos', categoria: 'Electrónica', subcategoriaSistema: 'consola', keywords: ['playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'switch'] },
    { id: 'elec-drone', nombre: 'Drone', categoria: 'Electrónica', subcategoriaSistema: 'drone', keywords: ['dji', 'mavic', 'phantom', 'volador'] },
    { id: 'elec-camara-dslr', nombre: 'Cámara DSLR / Mirrorless', categoria: 'Electrónica', subcategoriaSistema: 'camara', keywords: ['canon', 'nikon', 'sony', 'fuji', 'fotografia'] },
    { id: 'elec-gopro', nombre: 'Cámara de Acción GoPro', categoria: 'Electrónica', subcategoriaSistema: 'camara', keywords: ['action cam', 'gopro hero'] },
    { id: 'elec-audifonos', nombre: 'Audífonos Premium', categoria: 'Electrónica', subcategoriaSistema: 'auriculares', keywords: ['airpods', 'beats', 'sony', 'bose', 'headphones'] },
    { id: 'elec-parlante', nombre: 'Parlante Bluetooth', categoria: 'Electrónica', subcategoriaSistema: 'parlante', keywords: ['speaker', 'jbl', 'bose', 'harman'] },
    { id: 'elec-smartwatch', nombre: 'Smartwatch / Reloj Inteligente', categoria: 'Electrónica', subcategoriaSistema: 'smartwatch', keywords: ['apple watch', 'samsung watch', 'garmin'] },
    { id: 'elec-router', nombre: 'Router WiFi', categoria: 'Electrónica', subcategoriaSistema: 'pc_escritorio', keywords: ['tp-link', 'asus', 'mesh'] },

    // === JOYERÍA ===
    { id: 'joy-anillo-oro', nombre: 'Anillo de Oro', categoria: 'Joyería', subcategoriaSistema: 'anillo', keywords: ['sortija', 'oro 18k', 'oro 14k'] },
    { id: 'joy-cadena-oro', nombre: 'Cadena de Oro', categoria: 'Joyería', subcategoriaSistema: 'cadena', keywords: ['collar', 'oro 18k', 'eslabones'] },
    { id: 'joy-pulsera', nombre: 'Pulsera de Oro/Plata', categoria: 'Joyería', subcategoriaSistema: 'pulsera', keywords: ['brazalete', 'eslabones'] },
    { id: 'joy-aretes', nombre: 'Aretes / Pendientes', categoria: 'Joyería', subcategoriaSistema: 'arete', keywords: ['zarcillos', 'oro', 'diamante'] },
    { id: 'joy-dije', nombre: 'Dije / Medalla', categoria: 'Joyería', subcategoriaSistema: 'collar', keywords: ['colgante', 'oro', 'virgen'] },
    { id: 'joy-reloj-lujo', nombre: 'Reloj de Lujo', categoria: 'Joyería', subcategoriaSistema: 'reloj_oro', keywords: ['rolex', 'omega', 'tag heuer', 'cartier', 'tissot'] },
    { id: 'joy-diamante', nombre: 'Diamante Suelto', categoria: 'Joyería', subcategoriaSistema: 'anillo', keywords: ['brillante', 'quilate'] },
    { id: 'joy-perlas', nombre: 'Collar de Perlas', categoria: 'Joyería', subcategoriaSistema: 'collar', keywords: ['perla cultivada'] },
    { id: 'joy-plata', nombre: 'Joyería Plata 925', categoria: 'Joyería', subcategoriaSistema: 'pulsera', keywords: ['sterling silver'] },
    { id: 'joy-oro-blanco', nombre: 'Joyería Oro Blanco', categoria: 'Joyería', subcategoriaSistema: 'anillo', keywords: ['white gold'] },

    // === ELECTRODOMÉSTICOS ===
    { id: 'electro-refrigeradora', nombre: 'Refrigeradora', categoria: 'Electrodomésticos', subcategoriaSistema: 'refrigeradora', keywords: ['nevera', 'frigider', 'lg', 'samsung', 'mabe'] },
    { id: 'electro-lavadora', nombre: 'Lavadora', categoria: 'Electrodomésticos', subcategoriaSistema: 'lavadora', keywords: ['lavaropa', 'lg', 'samsung', 'whirlpool'] },
    { id: 'electro-secadora', nombre: 'Secadora de Ropa', categoria: 'Electrodomésticos', subcategoriaSistema: 'lavadora', keywords: ['dryer'] },
    { id: 'electro-microondas', nombre: 'Microondas', categoria: 'Electrodomésticos', subcategoriaSistema: 'microondas', keywords: ['horno microondas', 'lg', 'samsung'] },
    { id: 'electro-licuadora', nombre: 'Licuadora', categoria: 'Electrodomésticos', subcategoriaSistema: 'licuadora', keywords: ['blender', 'oster', 'ninja'] },
    { id: 'electro-aspiradora', nombre: 'Aspiradora', categoria: 'Electrodomésticos', subcategoriaSistema: 'aspiradora', keywords: ['vacuum', 'dyson', 'samsung'] },
    { id: 'electro-aire', nombre: 'Aire Acondicionado', categoria: 'Electrodomésticos', subcategoriaSistema: 'aire_acondicionado', keywords: ['ac', 'split', 'lg', 'samsung', 'mirage'] },
    { id: 'electro-ventilador', nombre: 'Ventilador', categoria: 'Electrodomésticos', subcategoriaSistema: 'ventilador', keywords: ['fan', 'torre', 'pedestal'] },
    { id: 'electro-cocina', nombre: 'Cocina / Estufa', categoria: 'Electrodomésticos', subcategoriaSistema: 'cocina', keywords: ['gas', 'electrica', 'indurama', 'mabe'] },
    { id: 'electro-horno', nombre: 'Horno Eléctrico', categoria: 'Electrodomésticos', subcategoriaSistema: 'horno_electrico', keywords: ['oster', 'black decker'] },
    { id: 'electro-freidora', nombre: 'Freidora de Aire', categoria: 'Electrodomésticos', subcategoriaSistema: 'freidora_aire', keywords: ['air fryer', 'oster', 'ninja'] },
    { id: 'electro-cafetera', nombre: 'Cafetera / Espresso', categoria: 'Electrodomésticos', subcategoriaSistema: 'otro_electrodomestico', keywords: ['nespresso', 'delonghi', 'oster'] },

    // === VEHÍCULOS ===
    { id: 'veh-moto', nombre: 'Motocicleta', categoria: 'Vehículos', subcategoriaSistema: 'moto', keywords: ['moto', 'honda', 'yamaha', 'suzuki', 'bajaj', 'italika'] },
    { id: 'veh-mototaxi', nombre: 'Mototaxi / Trimoto', categoria: 'Vehículos', subcategoriaSistema: 'mototaxi', keywords: ['torito', 'bajaj', 'tvs'] },
    { id: 'veh-auto', nombre: 'Automóvil', categoria: 'Vehículos', subcategoriaSistema: 'auto', keywords: ['carro', 'toyota', 'hyundai', 'kia', 'nissan'] },
    { id: 'veh-camioneta', nombre: 'Camioneta', categoria: 'Vehículos', subcategoriaSistema: 'suv', keywords: ['pickup', 'suv', 'hilux', 'fortuner'] },
    { id: 'veh-bici-electrica', nombre: 'Bicicleta Eléctrica', categoria: 'Vehículos', subcategoriaSistema: 'bicicleta_electrica', keywords: ['e-bike', 'electrica'] },
    { id: 'veh-scooter', nombre: 'Scooter Eléctrico', categoria: 'Vehículos', subcategoriaSistema: 'bicicleta_electrica', keywords: ['patineta electrica', 'xiaomi'] },
    { id: 'veh-bicicleta', nombre: 'Bicicleta', categoria: 'Vehículos', subcategoriaSistema: 'otro_vehiculo', keywords: ['bike', 'mtb', 'ruta', 'trek', 'specialized'] },
    { id: 'veh-triciclo', nombre: 'Triciclo de Carga', categoria: 'Vehículos', subcategoriaSistema: 'otro_vehiculo', keywords: ['triciclo delivery'] },

    // === HERRAMIENTAS ===
    { id: 'herr-taladro', nombre: 'Taladro', categoria: 'Herramientas', subcategoriaSistema: 'taladro', keywords: ['drill', 'bosch', 'makita', 'dewalt', 'percutor'] },
    { id: 'herr-amoladora', nombre: 'Amoladora / Esmeril', categoria: 'Herramientas', subcategoriaSistema: 'esmeril', keywords: ['grinder', 'bosch', 'makita', 'dewalt'] },
    { id: 'herr-sierra', nombre: 'Sierra Eléctrica', categoria: 'Herramientas', subcategoriaSistema: 'sierra', keywords: ['circular', 'caladora', 'dewalt'] },
    { id: 'herr-compresor', nombre: 'Compresor de Aire', categoria: 'Herramientas', subcategoriaSistema: 'compresor', keywords: ['compressor', 'campbell'] },
    { id: 'herr-soldadora', nombre: 'Soldadora', categoria: 'Herramientas', subcategoriaSistema: 'soldadora', keywords: ['welder', 'mig', 'tig', 'lincoln', 'miller'] },
    { id: 'herr-generador', nombre: 'Generador Eléctrico', categoria: 'Herramientas', subcategoriaSistema: 'generador', keywords: ['generator', 'planta electrica', 'honda'] },
    { id: 'herr-topografia', nombre: 'Equipo Topográfico', categoria: 'Herramientas', subcategoriaSistema: 'otro_herramienta', keywords: ['estacion total', 'nivel', 'teodolito', 'leica', 'topcon'] },
    { id: 'herr-rotomartillo', nombre: 'Rotomartillo', categoria: 'Herramientas', subcategoriaSistema: 'taladro', keywords: ['hilti', 'bosch', 'makita'] },
    { id: 'herr-cortadora', nombre: 'Cortadora de Concreto', categoria: 'Herramientas', subcategoriaSistema: 'otro_herramienta', keywords: ['stihl', 'husqvarna'] },
    { id: 'herr-pulidora', nombre: 'Pulidora', categoria: 'Herramientas', subcategoriaSistema: 'esmeril', keywords: ['polisher', 'dewalt', 'makita'] },

    // === INSTRUMENTOS MUSICALES ===
    { id: 'mus-guitarra', nombre: 'Guitarra Acústica/Eléctrica', categoria: 'Instrumentos', keywords: ['fender', 'gibson', 'yamaha', 'taylor', 'ibanez'] },
    { id: 'mus-piano', nombre: 'Piano Digital / Teclado', categoria: 'Instrumentos', keywords: ['yamaha', 'casio', 'roland', 'keyboard'] },
    { id: 'mus-violin', nombre: 'Violín', categoria: 'Instrumentos', keywords: ['stradivarius', 'suzuki'] },
    { id: 'mus-saxofon', nombre: 'Saxofón', categoria: 'Instrumentos', keywords: ['sax', 'selmer', 'yamaha', 'jupiter'] },
    { id: 'mus-trompeta', nombre: 'Trompeta', categoria: 'Instrumentos', keywords: ['bach', 'yamaha', 'conn'] },
    { id: 'mus-bateria', nombre: 'Batería', categoria: 'Instrumentos', keywords: ['drums', 'pearl', 'tama', 'dw'] },
    { id: 'mus-dj', nombre: 'Controlador DJ', categoria: 'Instrumentos', keywords: ['pioneer', 'numark', 'native instruments'] },
    { id: 'mus-amplificador', nombre: 'Amplificador', categoria: 'Instrumentos', keywords: ['marshall', 'fender', 'orange', 'vox'] },
    { id: 'mus-bajo', nombre: 'Bajo Eléctrico', categoria: 'Instrumentos', keywords: ['fender', 'ibanez', 'bass'] },
    { id: 'mus-acordeon', nombre: 'Acordeón', categoria: 'Instrumentos', keywords: ['hohner', 'gabbanelli'] },

    // === DEPORTES ===
    { id: 'dep-bicicleta', nombre: 'Bicicleta de Montaña/Ruta', categoria: 'Deportes', keywords: ['mtb', 'trek', 'specialized', 'giant'] },
    { id: 'dep-trotadora', nombre: 'Trotadora / Caminadora', categoria: 'Deportes', keywords: ['treadmill', 'proform', 'nordictrack'] },
    { id: 'dep-pesas', nombre: 'Set de Pesas / Mancuernas', categoria: 'Deportes', keywords: ['dumbbells', 'gym'] },
    { id: 'dep-eliptica', nombre: 'Elíptica', categoria: 'Deportes', keywords: ['elliptical', 'proform'] },
    { id: 'dep-golf', nombre: 'Equipo de Golf', categoria: 'Deportes', keywords: ['palos', 'clubs', 'callaway', 'titleist', 'taylormade'] },
    { id: 'dep-kayak', nombre: 'Kayak / Canoa', categoria: 'Deportes', keywords: ['paddleboard'] },
    { id: 'dep-patineta', nombre: 'Patineta / Skateboard', categoria: 'Deportes', keywords: ['skateboard', 'longboard'] },
    { id: 'dep-tabla-surf', nombre: 'Tabla de Surf', categoria: 'Deportes', keywords: ['surfboard'] },

    // === MUEBLES ===
    { id: 'mue-sofa', nombre: 'Sofá / Sillón', categoria: 'Muebles', keywords: ['mueble sala', 'living'] },
    { id: 'mue-escritorio', nombre: 'Escritorio', categoria: 'Muebles', keywords: ['desk', 'oficina'] },
    { id: 'mue-silla-gamer', nombre: 'Silla Gamer / Ergonómica', categoria: 'Muebles', keywords: ['chair', 'gaming'] },
    { id: 'mue-comedor', nombre: 'Juego de Comedor', categoria: 'Muebles', keywords: ['mesa', 'sillas'] },
    { id: 'mue-colchon', nombre: 'Colchón Premium', categoria: 'Muebles', keywords: ['mattress', 'spring', 'memory foam'] },
    { id: 'mue-cama', nombre: 'Cama / Base', categoria: 'Muebles', keywords: ['bed frame'] },

    // === ARTÍCULOS DE LUJO ===
    { id: 'lujo-bolso', nombre: 'Bolso de Diseñador', categoria: 'Lujo', keywords: ['louis vuitton', 'gucci', 'chanel', 'prada', 'hermes'] },
    { id: 'lujo-lentes', nombre: 'Lentes de Sol Premium', categoria: 'Lujo', keywords: ['ray-ban', 'oakley', 'gucci', 'prada'] },
    { id: 'lujo-zapatos', nombre: 'Zapatos de Diseñador', categoria: 'Lujo', keywords: ['gucci', 'louboutin', 'ferragamo'] },
    { id: 'lujo-maleta', nombre: 'Maleta Premium', categoria: 'Lujo', keywords: ['rimowa', 'samsonite', 'tumi'] },
    { id: 'lujo-perfume', nombre: 'Perfume de Lujo', categoria: 'Lujo', keywords: ['chanel', 'dior', 'tom ford'] },

    // === COLECCIONABLES ===
    { id: 'col-monedas', nombre: 'Monedas Antiguas', categoria: 'Coleccionables', keywords: ['numismatica', 'oro', 'plata'] },
    { id: 'col-billetes', nombre: 'Billetes Coleccionables', categoria: 'Coleccionables', keywords: ['numismatica'] },
    { id: 'col-sellos', nombre: 'Sellos Postales', categoria: 'Coleccionables', keywords: ['filatelia', 'stamps'] },
    { id: 'col-antiguedades', nombre: 'Antigüedades', categoria: 'Coleccionables', keywords: ['vintage', 'antiguo'] },
    { id: 'col-cuadros', nombre: 'Cuadros / Pinturas', categoria: 'Coleccionables', keywords: ['arte', 'oleo', 'acuarela'] },
    { id: 'col-vinos', nombre: 'Vinos Premium', categoria: 'Coleccionables', keywords: ['wine', 'champagne', 'coleccion'] },
    { id: 'col-figuras', nombre: 'Figuras Coleccionables', categoria: 'Coleccionables', keywords: ['funko', 'hot toys', 'anime'] },

    // === INDUSTRIAL ===
    { id: 'ind-motor', nombre: 'Motor Eléctrico/Gasolina', categoria: 'Industrial', keywords: ['engine', 'honda', 'briggs'] },
    { id: 'ind-bomba', nombre: 'Bomba de Agua', categoria: 'Industrial', keywords: ['pump', 'pedrollo'] },
    { id: 'ind-transformador', nombre: 'Transformador', categoria: 'Industrial', keywords: ['transformer'] },
    { id: 'ind-equipo-medico', nombre: 'Equipo Médico', categoria: 'Industrial', keywords: ['medical', 'dental', 'oximetro'] },
    { id: 'ind-balanza', nombre: 'Balanza Industrial', categoria: 'Industrial', keywords: ['scale', 'bascula'] },
    { id: 'ind-maquina-coser', nombre: 'Máquina de Coser', categoria: 'Industrial', keywords: ['singer', 'brother', 'juki', 'costura'] },
    { id: 'ind-telar', nombre: 'Telar / Textil', categoria: 'Industrial', keywords: ['weaving'] },
    { id: 'ind-impresora-3d', nombre: 'Impresora 3D', categoria: 'Industrial', keywords: ['3d printer', 'ender', 'prusa'] },

    // === ÓPTICA / FOTOGRAFÍA ===
    { id: 'opt-telescopio', nombre: 'Telescopio', categoria: 'Óptica', keywords: ['celestron', 'meade', 'astronomia'] },
    { id: 'opt-microscopio', nombre: 'Microscopio', categoria: 'Óptica', keywords: ['laboratory'] },
    { id: 'opt-binoculares', nombre: 'Binoculares', categoria: 'Óptica', keywords: ['nikon', 'bushnell'] },
    { id: 'opt-lente-camara', nombre: 'Lente de Cámara', categoria: 'Óptica', keywords: ['canon', 'nikon', 'sony', 'sigma'] },

    // === AGRÍCOLA ===
    { id: 'agr-motoguadana', nombre: 'Motoguadaña', categoria: 'Agrícola', keywords: ['stihl', 'husqvarna', 'weed trimmer'] },
    { id: 'agr-motosierra', nombre: 'Motosierra', categoria: 'Agrícola', keywords: ['stihl', 'husqvarna', 'chainsaw'] },
    { id: 'agr-fumigadora', nombre: 'Fumigadora', categoria: 'Agrícola', keywords: ['sprayer', 'mochila'] },
    { id: 'agr-motocultivador', nombre: 'Motocultivador', categoria: 'Agrícola', keywords: ['tiller', 'honda'] },
]

// Mapeo de categorías del catálogo fuzzy → categorías del sistema
export const MAPEO_CATEGORIAS: Record<string, string> = {
    'Electrónica': 'electronica',
    'Electrodomésticos': 'electrodomesticos',
    'Vehículos': 'vehiculos',
    'Joyería': 'joyas_oro',
    'Herramientas': 'herramientas',
    'Instrumentos': 'otro',
    'Deportes': 'otro',
    'Muebles': 'otro',
    'Lujo': 'joyas_oro',
    'Coleccionables': 'otro',
    'Industrial': 'herramientas',
    'Óptica': 'electronica',
    'Agrícola': 'herramientas',
}

// Obtener la categoría del sistema a partir de la categoría del catálogo
export function getCategoriaDelSistema(categoriaFuzzy: string): string {
    return MAPEO_CATEGORIAS[categoriaFuzzy] || 'otro'
}

// Obtener todas las categorías únicas
export const CATEGORIAS_DISPONIBLES = [...new Set(CATALOGO_BIENES.map(b => b.categoria))]

// Obtener items por categoría
export function getItemsPorCategoria(categoria: string): ItemCatalogo[] {
    return CATALOGO_BIENES.filter(b => b.categoria === categoria)
}

