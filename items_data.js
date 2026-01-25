
// Baza cijena materijala (u EUR)
// Cijene su izražene bez PDV-a (ili s PDV-om ovisno o izvoru - ovdje su prepisane točno sa slike)

const prices = {
    // --- TERMOIZOLACIJA ---
    xps: {
        // Cijene po m2 ovisno o debljini (cm)
        2: 2.87,
        3: 3.95,
        4: 5.27,
        5: 6.58,
        6: 7.90,
        8: 10.53,
        10: 13.16,
        12: 15.80,
        15: 21.01
    },

    wool_facade: {
        // Kamena vuna fasadna po cm
        8: 12.15,
        10: 15.19,
        12: 18.23,
        14: 21.26,
        15: 22.78
    },

    // --- HIDROIZOLACIJA ---
    membranes: {
        tpo_15: 9.33,  // FLAG TPO 1.5mm
        tpo_18: 11.22, // FLAG TPO 1.8mm
        tpo_20: 12.15, // FLAG TPO 2.0mm
        pvc_temelji: 6.24, // FLAG BSL 1.5mm
        pvc_krov: 9.11,    // FLAG SR 1.5mm
        cepasta: 1.60,      // Čepasta folija
        geotextile: 1.20   // Geotekstil (Placeholder)
    },

    bitumen: {
        diamond_p4: 4.88, // RAVAPROOF Diamond P 4
        ruby_v4: 3.71,    // RAVAPROOF Ruby V-4
        sapphire_g3: 1.91,
        sapphire_g4: 2.65,
        vapor_al: 4.89    // Vapor Al-35
    },

    // --- PANEL OGRADE ---
    // --- PANEL OGRADE ---
    fence: {
        // --- 2D PANELI (6/5/6 mm) --- (MPC - 8%)
        // 830: 30.60 * 0.92 = 28.15
        // 1030: 33.60 * 0.92 = 30.91
        // 1230: 39.10 * 0.92 = 35.97
        // 1430: 44.90 * 0.92 = 41.31 (Matches 143 cm)
        // 1630: 50.70 * 0.92 = 46.64 (Matches 163 cm)
        // 1830: 56.50 * 0.92 = 51.98 (Matches 183 cm)
        // 2030: 64.10 * 0.92 = 58.97
        panel_2d: {
            83: 28.15,
            103: 30.91,
            123: 35.97,
            143: 41.31,
            163: 46.64,
            183: 51.98,
            203: 58.97
        },

        // --- 3D PANELI (5 mm) --- (MPC - 8%)
        // 630: 17.70 * 0.92 = 16.28  (Used for 83? No, user sent 630, 830 etc.)
        // 830: 19.30 * 0.92 = 17.76
        // 1030: 23.30 * 0.92 = 21.44
        // 1230: 27.80 * 0.92 = 25.58
        // 1530: 32.90 * 0.92 = 30.27
        // 1730: 38.80 * 0.92 = 35.70
        // 2030: 44.80 * 0.92 = 41.22
        panel_3d_5: {
            63: 16.28,
            83: 17.76,
            103: 21.44,
            123: 25.58,
            153: 30.27,
            173: 35.70,
            203: 41.22
        },

        // --- 3D PANELI (4 mm) --- (MPC - 8%)
        // 830: 12.50 * 0.92 = 11.50
        // 1030: 14.50 * 0.92 = 13.34
        // 1230: 17.00 * 0.92 = 15.64
        // 1530: 21.10 * 0.92 = 19.41
        // 1730: 25.00 * 0.92 = 23.00
        // 2030: 33.00 * 0.92 = 30.36
        panel_3d_4: {
            83: 11.50,
            103: 13.34,
            123: 15.64,
            153: 19.41,
            173: 23.00,
            203: 30.36
        },

        // Stupovi (sa pločom) (MPC - 5%)
        // 850: 9.50 * 0.95 = 9.03 (approx 9.00)
        // 1050: 11.50 * 0.95 = 10.93
        // 1250: 12.00 * 0.95 = 11.40
        // 1550: 14.40 * 0.95 = 13.68
        // 1750: 16.30 * 0.95 = 15.49
        // 2050: 19.10 * 0.95 = 18.15
        posts: {
            85: 9.03,
            105: 10.93,
            125: 11.40,
            155: 13.68,
            175: 15.49,
            205: 18.15
        },

        // Pribor
        set_spojnica: 0.55, // Spojnica + samourezni vijak
        anker_vijci: 0.55,   // Po komadu
        montaza_plate: 25.00, // Cijena po metru (s pločicom)
        montaza_concrete: 40.00, // Cijena po metru (betoniranje)

        // Pješačka vrata (Dimenzija -> [Pločica, Beton])
        gate_prices: {
            '1000x1000': { plate: 250, concrete: 300 },
            '1000x1200': { plate: 270, concrete: 350 },
            '1000x1500': { plate: 310, concrete: 420 },
            '1000x1700': { plate: 360, concrete: 450 },
            '1000x2000': { plate: 400, concrete: 520 }
        }
    },

    chemicals: {
        aquamat_elastic: 1.86, // A+B (kg)
        isoflex_pu500: 8.27,   // kg
        ak20: 0.52             // Isomat AK 20 (kg)
    },

    others: {
        tpo_lim: 42.10, // kom (2x1m)
        pvc_lim: 37.97, // kom (2x1m)
        bentoshield: 7.17, // Bentoshield MAX5 (m2?)
        ob_12: 6.28,   // OBB ploča 12mm
        osb_15: 7.85,
        osb_18: 9.42,
        osb_22: 11.51,
        ethafoam: 1.94, // 5mm
        cellucushion: 1.40, // 5mm
        reflectix: 3.46
    }
};

// Pomoćna funkcija za dohvat cijene XPS-a
function getXPSPrice(thickness) {
    // Ako nema točne debljine, vraća 0 (ili se može dodati logika za najbližu)
    return prices.xps[thickness] || 0;
}

// Pomoćna funkcija za dohvat cijene vune
function getWoolPrice(thickness) {
    return prices.wool_facade[thickness] || 0;
}
