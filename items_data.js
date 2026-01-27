
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
        // --- 2D PANELI (6/5/6 mm) ---
        panel_2d: {
            83: 26.91, // Nema na popisu, koristim cijenu 103 kao fallback ili ostavim staro? Stavljam 103.
            103: 26.91,
            123: 35.87,
            143: 41.65,
            163: 47.70,
            183: 65.81,
            203: 65.82
        },

        // --- 3D PANELI (5 mm) ---
        panel_3d_5: {
            63: 20.81, // Fallback
            83: 20.81, // Fallback
            103: 20.81,
            123: 24.00,
            153: 30.67,
            173: 34.79,
            203: 41.03
        },

        // --- 3D PANELI (4 mm) ---
        panel_3d_4: {
            83: 13.01,
            103: 14.05,
            123: 17.32,
            153: 21.45,
            173: 24.19,
            203: 28.35
        },

        // Stupovi (sa pločom)
        posts: {
            85: 9.59,  // 800mm
            105: 10.78,
            125: 12.32,
            155: 19.84,
            175: 17.17, // Zanimljivo da je jeftiniji od 155, ali tako piše (19.838 vs 17.173)
            205: 20.19
        },

        // Stupovi (za beton, usadni)
        posts_concrete: {
            155: 14.95,
            175: 17.55,
            205: 20.15,
            225: 19.18, // Jeftiniji od 205?
            255: 22.43
        },

        // Pribor
        set_spojnica: 0.55,
        anker_vijci: 0.55,
        montaza_plate: 25.00,
        montaza_concrete: 40.00,

        // Pješačka vrata
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
