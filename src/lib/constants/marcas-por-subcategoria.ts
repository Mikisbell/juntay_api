// Catálogo COMPLETO de marcas por subcategoría
// Organizado en el mismo orden que categorias-bienes.ts

export type MarcaConfig = {
    value: string
    label: string
    subcategoriaId: string
    precioFactor?: number // Factor multiplicador (1.0 = base, 1.5 = 50% más caro, 0.8 = 20% más barato)
}

// ============================================
// MARCAS POR SUBCATEGORÍA - ORGANIZADAS
// ============================================

export const MARCAS_POR_SUBCATEGORIA: Record<string, MarcaConfig[]> = {
    // ========== ELECTRÓNICA ==========

    'celular': [
        { value: 'apple_iphone', label: 'Apple (iPhone)', subcategoriaId: 'celular', precioFactor: 1.8 },
        { value: 'samsung', label: 'Samsung', subcategoriaId: 'celular', precioFactor: 1.1 },
        { value: 'xiaomi', label: 'Xiaomi / Redmi', subcategoriaId: 'celular', precioFactor: 0.9 },
        { value: 'huawei', label: 'Huawei', subcategoriaId: 'celular', precioFactor: 0.85 },
        { value: 'motorola', label: 'Motorola', subcategoriaId: 'celular', precioFactor: 0.8 },
        { value: 'lg_cel', label: 'LG', subcategoriaId: 'celular', precioFactor: 0.8 },
        { value: 'oppo', label: 'OPPO', subcategoriaId: 'celular', precioFactor: 0.85 },
        { value: 'realme', label: 'Realme', subcategoriaId: 'celular', precioFactor: 0.75 },
        { value: 'otra_celular', label: 'Otra (Especificar)', subcategoriaId: 'celular' }
    ],

    'laptop': [
        { value: 'apple_mac', label: 'Apple (MacBook)', subcategoriaId: 'laptop', precioFactor: 1.8 },
        { value: 'dell', label: 'Dell', subcategoriaId: 'laptop', precioFactor: 1.0 },
        { value: 'hp', label: 'HP', subcategoriaId: 'laptop', precioFactor: 1.0 },
        { value: 'lenovo', label: 'Lenovo', subcategoriaId: 'laptop', precioFactor: 1.0 },
        { value: 'asus', label: 'Asus', subcategoriaId: 'laptop', precioFactor: 1.0 },
        { value: 'acer', label: 'Acer', subcategoriaId: 'laptop', precioFactor: 0.9 },
        { value: 'toshiba', label: 'Toshiba', subcategoriaId: 'laptop', precioFactor: 0.9 },
        { value: 'msi', label: 'MSI', subcategoriaId: 'laptop', precioFactor: 1.2 },
        { value: 'otra_laptop', label: 'Otra (Especificar)', subcategoriaId: 'laptop' }
    ],

    'tablet': [
        { value: 'apple_ipad', label: 'Apple (iPad)', subcategoriaId: 'tablet', precioFactor: 1.6 },
        { value: 'samsung_tab', label: 'Samsung Galaxy Tab', subcategoriaId: 'tablet', precioFactor: 1.1 },
        { value: 'huawei_tab', label: 'Huawei MatePad', subcategoriaId: 'tablet', precioFactor: 0.9 },
        { value: 'lenovo_tab', label: 'Lenovo', subcategoriaId: 'tablet', precioFactor: 0.8 },
        { value: 'xiaomi_tab', label: 'Xiaomi Pad', subcategoriaId: 'tablet', precioFactor: 0.85 },
        { value: 'otra_tablet', label: 'Otra (Especificar)', subcategoriaId: 'tablet' }
    ],

    'smartwatch': [
        { value: 'apple_watch', label: 'Apple Watch', subcategoriaId: 'smartwatch', precioFactor: 1.8 },
        { value: 'samsung_watch', label: 'Samsung Galaxy Watch', subcategoriaId: 'smartwatch', precioFactor: 1.1 },
        { value: 'huawei_watch', label: 'Huawei Watch', subcategoriaId: 'smartwatch', precioFactor: 0.9 },
        { value: 'xiaomi_watch', label: 'Xiaomi Mi Watch', subcategoriaId: 'smartwatch', precioFactor: 0.7 },
        { value: 'amazfit', label: 'Amazfit', subcategoriaId: 'smartwatch', precioFactor: 0.6 },
        { value: 'otra_smartwatch', label: 'Otra (Especificar)', subcategoriaId: 'smartwatch' }
    ],

    'tv': [
        { value: 'samsung_tv', label: 'Samsung', subcategoriaId: 'tv', precioFactor: 1.2 },
        { value: 'lg_tv', label: 'LG', subcategoriaId: 'tv', precioFactor: 1.2 },
        { value: 'sony_tv', label: 'Sony', subcategoriaId: 'tv', precioFactor: 1.3 },
        { value: 'tcl', label: 'TCL', subcategoriaId: 'tv', precioFactor: 0.8 },
        { value: 'hisense', label: 'Hisense', subcategoriaId: 'tv', precioFactor: 0.75 },
        { value: 'panasonic_tv', label: 'Panasonic', subcategoriaId: 'tv', precioFactor: 1.0 },
        { value: 'otra_tv', label: 'Otra (Especificar)', subcategoriaId: 'tv' }
    ],

    'pc_escritorio': [
        { value: 'apple_imac', label: 'Apple (iMac)', subcategoriaId: 'pc_escritorio', precioFactor: 1.8 },
        { value: 'hp_pc', label: 'HP', subcategoriaId: 'pc_escritorio', precioFactor: 1.0 },
        { value: 'dell_pc', label: 'Dell', subcategoriaId: 'pc_escritorio', precioFactor: 1.0 },
        { value: 'lenovo_pc', label: 'Lenovo', subcategoriaId: 'pc_escritorio', precioFactor: 1.0 },
        { value: 'ensamblado', label: 'PC Ensamblado', subcategoriaId: 'pc_escritorio', precioFactor: 0.9 },
        { value: 'otra_pc', label: 'Otra (Especificar)', subcategoriaId: 'pc_escritorio' }
    ],

    'consola': [
        { value: 'playstation', label: 'PlayStation (Sony)', subcategoriaId: 'consola', precioFactor: 1.2 },
        { value: 'xbox', label: 'Xbox (Microsoft)', subcategoriaId: 'consola', precioFactor: 1.1 },
        { value: 'nintendo_switch', label: 'Nintendo Switch', subcategoriaId: 'consola', precioFactor: 1.0 },
        { value: 'otra_consola', label: 'Otra (Especificar)', subcategoriaId: 'consola' }
    ],

    'camara': [
        { value: 'canon', label: 'Canon', subcategoriaId: 'camara', precioFactor: 1.2 },
        { value: 'nikon', label: 'Nikon', subcategoriaId: 'camara', precioFactor: 1.2 },
        { value: 'sony_cam', label: 'Sony', subcategoriaId: 'camara', precioFactor: 1.3 },
        { value: 'gopro', label: 'GoPro', subcategoriaId: 'camara', precioFactor: 1.1 },
        { value: 'otra_camara', label: 'Otra (Especificar)', subcategoriaId: 'camara' }
    ],

    'drone': [
        { value: 'dji', label: 'DJI', subcategoriaId: 'drone', precioFactor: 1.4 },
        { value: 'parrot', label: 'Parrot', subcategoriaId: 'drone', precioFactor: 1.1 },
        { value: 'xiaomi_drone', label: 'Xiaomi', subcategoriaId: 'drone', precioFactor: 0.8 },
        { value: 'otra_drone', label: 'Otra (Especificar)', subcategoriaId: 'drone' }
    ],

    // ========== ELECTRODOMÉSTICOS ==========

    'refrigeradora': [
        { value: 'lg_refri', label: 'LG', subcategoriaId: 'refrigeradora', precioFactor: 1.1 },
        { value: 'samsung_refri', label: 'Samsung', subcategoriaId: 'refrigeradora', precioFactor: 1.1 },
        { value: 'mabe', label: 'Mabe', subcategoriaId: 'refrigeradora', precioFactor: 0.9 },
        { value: 'indurama_refri', label: 'Indurama', subcategoriaId: 'refrigeradora', precioFactor: 0.85 },
        { value: 'electrolux_refri', label: 'Electrolux', subcategoriaId: 'refrigeradora', precioFactor: 1.0 },
        { value: 'otra_refri', label: 'Otra (Especificar)', subcategoriaId: 'refrigeradora' }
    ],

    'lavadora': [
        { value: 'lg_lava', label: 'LG', subcategoriaId: 'lavadora', precioFactor: 1.1 },
        { value: 'samsung_lava', label: 'Samsung', subcategoriaId: 'lavadora', precioFactor: 1.1 },
        { value: 'whirlpool', label: 'Whirlpool', subcategoriaId: 'lavadora', precioFactor: 1.0 },
        { value: 'mabe_lava', label: 'Mabe', subcategoriaId: 'lavadora', precioFactor: 0.9 },
        { value: 'electrolux_lava', label: 'Electrolux', subcategoriaId: 'lavadora', precioFactor: 1.0 },
        { value: 'otra_lava', label: 'Otra (Especificar)', subcategoriaId: 'lavadora' }
    ],

    'cocina': [
        { value: 'indurama_cocina', label: 'Indurama', subcategoriaId: 'cocina', precioFactor: 1.0 },
        { value: 'mabe_cocina', label: 'Mabe', subcategoriaId: 'cocina', precioFactor: 1.0 },
        { value: 'lg_cocina', label: 'LG', subcategoriaId: 'cocina', precioFactor: 1.1 },
        { value: 'electrolux_cocina', label: 'Electrolux', subcategoriaId: 'cocina', precioFactor: 1.0 },
        { value: 'otra_cocina', label: 'Otra (Especificar)', subcategoriaId: 'cocina' }
    ],

    'microondas': [
        { value: 'lg_micro', label: 'LG', subcategoriaId: 'microondas', precioFactor: 1.0 },
        { value: 'samsung_micro', label: 'Samsung', subcategoriaId: 'microondas', precioFactor: 1.0 },
        { value: 'panasonic_micro', label: 'Panasonic', subcategoriaId: 'microondas', precioFactor: 1.1 },
        { value: 'indurama_micro', label: 'Indurama', subcategoriaId: 'microondas', precioFactor: 0.8 },
        { value: 'otra_micro', label: 'Otra (Especificar)', subcategoriaId: 'microondas' }
    ],

    'licuadora': [
        { value: 'oster', label: 'Oster', subcategoriaId: 'licuadora', precioFactor: 1.1 },
        { value: 'philips_licu', label: 'Philips', subcategoriaId: 'licuadora', precioFactor: 1.0 },
        { value: 'imaco', label: 'Imaco', subcategoriaId: 'licuadora', precioFactor: 0.8 },
        { value: 'otra_licuadora', label: 'Otra (Especificar)', subcategoriaId: 'licuadora' }
    ],

    'batidora': [
        { value: 'oster_bat', label: 'Oster', subcategoriaId: 'batidora', precioFactor: 1.1 },
        { value: 'philips_bat', label: 'Philips', subcategoriaId: 'batidora', precioFactor: 1.0 },
        { value: 'kitchenaid', label: 'KitchenAid', subcategoriaId: 'batidora', precioFactor: 1.3 },
        { value: 'otra_batidora', label: 'Otra (Especificar)', subcategoriaId: 'batidora' }
    ],

    'horno_electrico': [
        { value: 'oster_horno', label: 'Oster', subcategoriaId: 'horno_electrico', precioFactor: 1.0 },
        { value: 'black_decker_horno', label: 'Black & Decker', subcategoriaId: 'horno_electrico', precioFactor: 0.9 },
        { value: 'indurama_horno', label: 'Indurama', subcategoriaId: 'horno_electrico', precioFactor: 0.85 },
        { value: 'otra_horno', label: 'Otra (Especificar)', subcategoriaId: 'horno_electrico' }
    ],

    'freidora_aire': [
        { value: 'oster_air', label: 'Oster', subcategoriaId: 'freidora_aire', precioFactor: 1.0 },
        { value: 'philips_air', label: 'Philips', subcategoriaId: 'freidora_aire', precioFactor: 1.2 },
        { value: 'xiaomi_air', label: 'Xiaomi', subcategoriaId: 'freidora_aire', precioFactor: 0.9 },
        { value: 'otra_freidora', label: 'Otra (Especificar)', subcategoriaId: 'freidora_aire' }
    ],

    'aspiradora': [
        { value: 'electrolux_asp', label: 'Electrolux', subcategoriaId: 'aspiradora', precioFactor: 1.1 },
        { value: 'bissell', label: 'Bissell', subcategoriaId: 'aspiradora', precioFactor: 1.0 },
        { value: 'karcher', label: 'Kärcher', subcategoriaId: 'aspiradora', precioFactor: 1.2 },
        { value: 'otra_aspiradora', label: 'Otra (Especificar)', subcategoriaId: 'aspiradora' }
    ],

    'plancha': [
        { value: 'philips_plancha', label: 'Philips', subcategoriaId: 'plancha', precioFactor: 1.0 },
        { value: 'oster_plancha', label: 'Oster', subcategoriaId: 'plancha', precioFactor: 0.9 },
        { value: 'otra_plancha', label: 'Otra (Especificar)', subcategoriaId: 'plancha' }
    ],

    'ventilador': [
        { value: 'indurama_vent', label: 'Indurama', subcategoriaId: 'ventilador', precioFactor: 0.9 },
        { value: 'samurai', label: 'Samurai', subcategoriaId: 'ventilador', precioFactor: 0.8 },
        { value: 'otra_ventilador', label: 'Otra (Especificar)', subcategoriaId: 'ventilador' }
    ],

    'aire_acondicionado': [
        { value: 'lg_aire', label: 'LG', subcategoriaId: 'aire_acondicionado', precioFactor: 1.1 },
        { value: 'samsung_aire', label: 'Samsung', subcategoriaId: 'aire_acondicionado', precioFactor: 1.1 },
        { value: 'carrier', label: 'Carrier', subcategoriaId: 'aire_acondicionado', precioFactor: 1.2 },
        { value: 'otra_aire', label: 'Otra (Especificar)', subcategoriaId: 'aire_acondicionado' }
    ],

    'equipo_sonido': [
        { value: 'sony_audio', label: 'Sony', subcategoriaId: 'equipo_sonido', precioFactor: 1.2 },
        { value: 'lg_audio', label: 'LG', subcategoriaId: 'equipo_sonido', precioFactor: 1.1 },
        { value: 'panasonic_audio', label: 'Panasonic', subcategoriaId: 'equipo_sonido', precioFactor: 1.0 },
        { value: 'otra_audio', label: 'Otra (Especificar)', subcategoriaId: 'equipo_sonido' }
    ],

    'parlante': [
        { value: 'jbl', label: 'JBL', subcategoriaId: 'parlante', precioFactor: 1.3 },
        { value: 'bose', label: 'Bose', subcategoriaId: 'parlante', precioFactor: 1.5 },
        { value: 'sony_parlante', label: 'Sony', subcategoriaId: 'parlante', precioFactor: 1.1 },
        { value: 'otra_parlante', label: 'Otra (Especificar)', subcategoriaId: 'parlante' }
    ],

    'auriculares': [
        { value: 'apple_airpods', label: 'Apple AirPods', subcategoriaId: 'auriculares', precioFactor: 1.5 },
        { value: 'sony_auri', label: 'Sony', subcategoriaId: 'auriculares', precioFactor: 1.2 },
        { value: 'jbl_auri', label: 'JBL', subcategoriaId: 'auriculares', precioFactor: 1.1 },
        { value: 'otra_auri', label: 'Otra (Especificar)', subcategoriaId: 'auriculares' }
    ],

    'proyector': [
        { value: 'epson', label: 'Epson', subcategoriaId: 'proyector', precioFactor: 1.2 },
        { value: 'benq', label: 'BenQ', subcategoriaId: 'proyector', precioFactor: 1.1 },
        { value: 'otra_proyector', label: 'Otra (Especificar)', subcategoriaId: 'proyector' }
    ],

    // ========== VEHÍCULOS ==========

    'auto': [
        { value: 'toyota', label: 'Toyota', subcategoriaId: 'auto', precioFactor: 1.1 },
        { value: 'nissan', label: 'Nissan', subcategoriaId: 'auto', precioFactor: 1.0 },
        { value: 'hyundai', label: 'Hyundai', subcategoriaId: 'auto', precioFactor: 0.95 },
        { value: 'kia', label: 'Kia', subcategoriaId: 'auto', precioFactor: 0.9 },
        { value: 'chevrolet', label: 'Chevrolet', subcategoriaId: 'auto', precioFactor: 0.95 },
        { value: 'honda_auto', label: 'Honda', subcategoriaId: 'auto', precioFactor: 1.1 },
        { value: 'mazda', label: 'Mazda', subcategoriaId: 'auto', precioFactor: 1.0 },
        { value: 'otra_auto', label: 'Otra (Especificar)', subcategoriaId: 'auto' }
    ],

    'suv': [
        { value: 'toyota_suv', label: 'Toyota', subcategoriaId: 'suv', precioFactor: 1.2 },
        { value: 'nissan_suv', label: 'Nissan', subcategoriaId: 'suv', precioFactor: 1.1 },
        { value: 'hyundai_suv', label: 'Hyundai', subcategoriaId: 'suv', precioFactor: 1.0 },
        { value: 'kia_suv', label: 'Kia', subcategoriaId: 'suv', precioFactor: 1.0 },
        { value: 'otra_suv', label: 'Otra (Especificar)', subcategoriaId: 'suv' }
    ],

    'camioneta_trabajo': [
        { value: 'toyota_cam', label: 'Toyota', subcategoriaId: 'camioneta_trabajo', precioFactor: 1.2 },
        { value: 'nissan_cam', label: 'Nissan', subcategoriaId: 'camioneta_trabajo', precioFactor: 1.1 },
        { value: 'otra_camioneta', label: 'Otra (Especificar)', subcategoriaId: 'camioneta_trabajo' }
    ],

    'moto': [
        { value: 'honda_moto', label: 'Honda', subcategoriaId: 'moto', precioFactor: 1.1 },
        { value: 'yamaha', label: 'Yamaha', subcategoriaId: 'moto', precioFactor: 1.1 },
        { value: 'suzuki', label: 'Suzuki', subcategoriaId: 'moto', precioFactor: 1.0 },
        { value: 'bajaj', label: 'Bajaj', subcategoriaId: 'moto', precioFactor: 0.8 },
        { value: 'kawasaki', label: 'Kawasaki', subcategoriaId: 'moto', precioFactor: 1.2 },
        { value: 'otra_moto', label: 'Otra (Especificar)', subcategoriaId: 'moto' }
    ],

    'mototaxi': [
        { value: 'bajaj_moto', label: 'Bajaj', subcategoriaId: 'mototaxi', precioFactor: 1.0 },
        { value: 'tvs', label: 'TVS', subcategoriaId: 'mototaxi', precioFactor: 0.9 },
        { value: 'otra_mototaxi', label: 'Otra (Especificar)', subcategoriaId: 'mototaxi' }
    ],

    'bicicleta_electrica': [
        { value: 'xiaomi_bici', label: 'Xiaomi', subcategoriaId: 'bicicleta_electrica', precioFactor: 1.0 },
        { value: 'giant', label: 'Giant', subcategoriaId: 'bicicleta_electrica', precioFactor: 1.2 },
        { value: 'otra_bici', label: 'Otra (Especificar)', subcategoriaId: 'bicicleta_electrica' }
    ],

    // ========== JOYAS (por quilates, no por marca tradicional) ==========

    'cadena': [
        { value: 'oro_18k_cadena', label: 'Oro 18K', subcategoriaId: 'cadena', precioFactor: 1.3 },
        { value: 'oro_14k_cadena', label: 'Oro 14K', subcategoriaId: 'cadena', precioFactor: 1.0 },
        { value: 'oro_10k_cadena', label: 'Oro 10K', subcategoriaId: 'cadena', precioFactor: 0.7 },
        { value: 'plata_cadena', label: 'Plata 925', subcategoriaId: 'cadena', precioFactor: 0.3 },
        { value: 'otra_cadena', label: 'Otro (Especificar)', subcategoriaId: 'cadena' }
    ],

    'anillo': [
        { value: 'oro_18k_anillo', label: 'Oro 18K', subcategoriaId: 'anillo', precioFactor: 1.3 },
        { value: 'oro_14k_anillo', label: 'Oro 14K', subcategoriaId: 'anillo', precioFactor: 1.0 },
        { value: 'oro_10k_anillo', label: 'Oro 10K', subcategoriaId: 'anillo', precioFactor: 0.7 },
        { value: 'plata_anillo', label: 'Plata 925', subcategoriaId: 'anillo', precioFactor: 0.3 },
        { value: 'otra_anillo', label: 'Otro (Especificar)', subcategoriaId: 'anillo' }
    ],

    'collar': [
        { value: 'oro_18k_collar', label: 'Oro 18K', subcategoriaId: 'collar', precioFactor: 1.3 },
        { value: 'oro_14k_collar', label: 'Oro 14K', subcategoriaId: 'collar', precioFactor: 1.0 },
        { value: 'oro_10k_collar', label: 'Oro 10K', subcategoriaId: 'collar', precioFactor: 0.7 },
        { value: 'plata_collar', label: 'Plata 925', subcategoriaId: 'collar', precioFactor: 0.3 },
        { value: 'otra_collar', label: 'Otro (Especificar)', subcategoriaId: 'collar' }
    ],

    'pulsera': [
        { value: 'oro_18k_pulsera', label: 'Oro 18K', subcategoriaId: 'pulsera', precioFactor: 1.3 },
        { value: 'oro_14k_pulsera', label: 'Oro 14K', subcategoriaId: 'pulsera', precioFactor: 1.0 },
        { value: 'oro_10k_pulsera', label: 'Oro 10K', subcategoriaId: 'pulsera', precioFactor: 0.7 },
        { value: 'plata_pulsera', label: 'Plata 925', subcategoriaId: 'pulsera', precioFactor: 0.3 },
        { value: 'otra_pulsera', label: 'Otro (Especificar)', subcategoriaId: 'pulsera' }
    ],

    'arete': [
        { value: 'oro_18k_arete', label: 'Oro 18K', subcategoriaId: 'arete', precioFactor: 1.3 },
        { value: 'oro_14k_arete', label: 'Oro 14K', subcategoriaId: 'arete', precioFactor: 1.0 },
        { value: 'plata_arete', label: 'Plata 925', subcategoriaId: 'arete', precioFactor: 0.3 },
        { value: 'otra_arete', label: 'Otro (Especificar)', subcategoriaId: 'arete' }
    ],

    'reloj_oro': [
        { value: 'rolex', label: 'Rolex', subcategoriaId: 'reloj_oro', precioFactor: 3.0 },
        { value: 'omega', label: 'Omega', subcategoriaId: 'reloj_oro', precioFactor: 2.0 },
        { value: 'tag_heuer', label: 'TAG Heuer', subcategoriaId: 'reloj_oro', precioFactor: 1.5 },
        { value: 'casio_oro', label: 'Casio (Oro)', subcategoriaId: 'reloj_oro', precioFactor: 0.5 },
        { value: 'seiko_oro', label: 'Seiko (Oro)', subcategoriaId: 'reloj_oro', precioFactor: 0.8 },
        { value: 'otra_reloj', label: 'Otro (Especificar)', subcategoriaId: 'reloj_oro' }
    ],

    // ========== HERRAMIENTAS ==========

    'taladro': [
        { value: 'dewalt', label: 'DeWalt', subcategoriaId: 'taladro', precioFactor: 1.3 },
        { value: 'bosch', label: 'Bosch', subcategoriaId: 'taladro', precioFactor: 1.2 },
        { value: 'makita', label: 'Makita', subcategoriaId: 'taladro', precioFactor: 1.2 },
        { value: 'black_decker', label: 'Black & Decker', subcategoriaId: 'taladro', precioFactor: 0.9 },
        { value: 'otra_taladro', label: 'Otra (Especificar)', subcategoriaId: 'taladro' }
    ],

    'sierra': [
        { value: 'dewalt_sierra', label: 'DeWalt', subcategoriaId: 'sierra', precioFactor: 1.3 },
        { value: 'bosch_sierra', label: 'Bosch', subcategoriaId: 'sierra', precioFactor: 1.2 },
        { value: 'makita_sierra', label: 'Makita', subcategoriaId: 'sierra', precioFactor: 1.2 },
        { value: 'otra_sierra', label: 'Otra (Especificar)', subcategoriaId: 'sierra' }
    ],

    'esmeril': [
        { value: 'dewalt_esm', label: 'DeWalt', subcategoriaId: 'esmeril', precioFactor: 1.3 },
        { value: 'bosch_esm', label: 'Bosch', subcategoriaId: 'esmeril', precioFactor: 1.2 },
        { value: 'makita_esm', label: 'Makita', subcategoriaId: 'esmeril', precioFactor: 1.2 },
        { value: 'otra_esmeril', label: 'Otra (Especificar)', subcategoriaId: 'esmeril' }
    ],

    'lijadora': [
        { value: 'dewalt_lij', label: 'DeWalt', subcategoriaId: 'lijadora', precioFactor: 1.3 },
        { value: 'bosch_lij', label: 'Bosch', subcategoriaId: 'lijadora', precioFactor: 1.2 },
        { value: 'otra_lijadora', label: 'Otra (Especificar)', subcategoriaId: 'lijadora' }
    ],

    'soldadora': [
        { value: 'lincoln', label: 'Lincoln Electric', subcategoriaId: 'soldadora', precioFactor: 1.3 },
        { value: 'miller', label: 'Miller', subcategoriaId: 'soldadora', precioFactor: 1.3 },
        { value: 'infra', label: 'Infra', subcategoriaId: 'soldadora', precioFactor: 1.0 },
        { value: 'otra_soldadora', label: 'Otra (Especificar)', subcategoriaId: 'soldadora' }
    ],

    'compresor': [
        { value: 'dewalt_comp', label: 'DeWalt', subcategoriaId: 'compresor', precioFactor: 1.3 },
        { value: 'campbell', label: 'Campbell Hausfeld', subcategoriaId: 'compresor', precioFactor: 1.2 },
        { value: 'truper', label: 'Truper', subcategoriaId: 'compresor', precioFactor: 0.9 },
        { value: 'otra_compresor', label: 'Otra (Especificar)', subcategoriaId: 'compresor' }
    ],

    'generador': [
        { value: 'honda_gen', label: 'Honda', subcategoriaId: 'generador', precioFactor: 1.4 },
        { value: 'yamaha_gen', label: 'Yamaha', subcategoriaId: 'generador', precioFactor: 1.3 },
        { value: 'hyundai_gen', label: 'Hyundai', subcategoriaId: 'generador', precioFactor: 1.0 },
        { value: 'otra_generador', label: 'Otra (Especificar)', subcategoriaId: 'generador' }
    ],

    'motobomba': [
        { value: 'honda_bomb', label: 'Honda', subcategoriaId: 'motobomba', precioFactor: 1.3 },
        { value: 'yamaha_bomb', label: 'Yamaha', subcategoriaId: 'motobomba', precioFactor: 1.2 },
        { value: 'otra_motobomba', label: 'Otra (Especificar)', subcategoriaId: 'motobomba' }
    ],

    'motosierra': [
        { value: 'stihl', label: 'Stihl', subcategoriaId: 'motosierra', precioFactor: 1.3 },
        { value: 'husqvarna', label: 'Husqvarna', subcategoriaId: 'motosierra', precioFactor: 1.2 },
        { value: 'otra_motosierra', label: 'Otra (Especificar)', subcategoriaId: 'motosierra' }
    ],

    'cortadora_cesped': [
        { value: 'honda_cort', label: 'Honda', subcategoriaId: 'cortadora_cesped', precioFactor: 1.2 },
        { value: 'husqvarna_cort', label: 'Husqvarna', subcategoriaId: 'cortadora_cesped', precioFactor: 1.1 },
        { value: 'otra_cortadora', label: 'Otra (Especificar)', subcategoriaId: 'cortadora_cesped' }
    ],

    // ========== OTROS (CATCH-ALLS) ==========
    'otro_electronico': [{ value: 'otra_electronico', label: 'Otra (Especificar)', subcategoriaId: 'otro_electronico' }],
    'otro_electrodomestico': [{ value: 'otra_electrodomestico', label: 'Otra (Especificar)', subcategoriaId: 'otro_electrodomestico' }],
    'otro_vehiculo': [{ value: 'otra_vehiculo', label: 'Otra (Especificar)', subcategoriaId: 'otro_vehiculo' }],
    'otro_joya': [{ value: 'otra_joya', label: 'Otra (Especificar)', subcategoriaId: 'otro_joya' }],
    'otro_herramienta': [{ value: 'otra_herramienta', label: 'Otra (Especificar)', subcategoriaId: 'otro_herramienta' }],
    'otro_inmueble': [{ value: 'otra_inmueble', label: 'Otra (Especificar)', subcategoriaId: 'otro_inmueble' }],
    'otro_general': [{ value: 'otra_general', label: 'Otra (Especificar)', subcategoriaId: 'otro_general' }],

    // Subcategorías de "Otros Bienes"
    'instrumento_musical': [
        { value: 'yamaha_inst', label: 'Yamaha', subcategoriaId: 'instrumento_musical', precioFactor: 1.1 },
        { value: 'fender', label: 'Fender', subcategoriaId: 'instrumento_musical', precioFactor: 1.2 },
        { value: 'gibson', label: 'Gibson', subcategoriaId: 'instrumento_musical', precioFactor: 1.3 },
        { value: 'casio', label: 'Casio', subcategoriaId: 'instrumento_musical', precioFactor: 0.8 },
        { value: 'otra_instrumento', label: 'Otra (Especificar)', subcategoriaId: 'instrumento_musical' }
    ],
    'mueble': [{ value: 'otra_mueble', label: 'Otra (Especificar)', subcategoriaId: 'mueble' }],
    'bicicleta': [
        { value: 'trek', label: 'Trek', subcategoriaId: 'bicicleta', precioFactor: 1.2 },
        { value: 'specialized', label: 'Specialized', subcategoriaId: 'bicicleta', precioFactor: 1.2 },
        { value: 'monark', label: 'Monark', subcategoriaId: 'bicicleta', precioFactor: 0.9 },
        { value: 'otra_bicicleta', label: 'Otra (Especificar)', subcategoriaId: 'bicicleta' }
    ],
    'equipo_deporte': [{ value: 'otra_deporte', label: 'Otra (Especificar)', subcategoriaId: 'equipo_deporte' }],
    'billetera': [
        { value: 'renzo_costa', label: 'Renzo Costa', subcategoriaId: 'billetera', precioFactor: 1.2 },
        { value: 'gucci', label: 'Gucci', subcategoriaId: 'billetera', precioFactor: 2.5 },
        { value: 'louis_vuitton', label: 'Louis Vuitton', subcategoriaId: 'billetera', precioFactor: 2.8 },
        { value: 'prada', label: 'Prada', subcategoriaId: 'billetera', precioFactor: 2.2 },
        { value: 'michael_kors', label: 'Michael Kors', subcategoriaId: 'billetera', precioFactor: 1.5 },
        { value: 'coach', label: 'Coach', subcategoriaId: 'billetera', precioFactor: 1.4 },
        { value: 'generica_billetera', label: 'Genérica / Sin Marca', subcategoriaId: 'billetera', precioFactor: 0.5 },
        { value: 'otra_billetera', label: 'Otra (Especificar)', subcategoriaId: 'billetera' }
    ]
}

// Helper para obtener marcas de una subcategoría
export function getMarcasPorSubcategoria(subcategoriaValue: string): MarcaConfig[] {
    return MARCAS_POR_SUBCATEGORIA[subcategoriaValue] || []
}

// Helper para obtener factor de precio de una marca
export function getPrecioFactorMarca(subcategoriaValue: string, marcaValue: string): number {
    const marcas = getMarcasPorSubcategoria(subcategoriaValue)
    const marca = marcas.find(m => m.value === marcaValue)
    return marca?.precioFactor || 1.0
}
