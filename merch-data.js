// Catalogo Oficial de Merchandising - MYOOZ InC
// Sin dependencia de Shopify - Datos locales rápidos y sincronizables con Printful

const merchProducts = [
    // --- 1. MYOOZ INC ---
    {
        id: 'myooz-jersey',
        name: 'MYOOZ InC Jersey',
        price: 22.99,
        category: 'MYOOZ InC',
        tag: 'Classic Essential',
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/myoozinc-blackjersey.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/myoozinc-whitejersey.png' }
        ]
    },
    {
        id: 'myooz-hoodie',
        name: 'MYOOZ InC Hoodie',
        price: 44.99,
        category: 'MYOOZ InC',
        tag: 'Signature Merch',
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/myoozinc-hoodie.png' }
        ]
    },

    // --- 2. GGB BEATS LOGO (Brand Collection) ---
    {
        id: 'ggb-adidas-hat',
        name: 'GGB Beats Adidas Hat',
        price: 43.99,
        category: 'GGB Beats',
        tag: 'Sportswear',
        isLogo: true,
        isHat: true,
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeats-adidas-blackhat.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/ggbbeats-adidas-whitehat.png' }
        ]
    },
    {
        id: 'ggb-standard-hat',
        name: 'GGB Beats Hat',
        price: 24.99,
        category: 'GGB Beats',
        tag: 'Accessory',
        isLogo: true,
        isHat: true,
        defaultColor: 'White',
        variants: [
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/ggbbeats-whitehat.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeats-blackhat.png' }
        ]
    },
    {
        id: 'ggb-hoodie',
        name: 'GGB Beats Hoodie',
        price: 44.99,
        category: 'GGB Beats',
        tag: 'Premium Collection',
        isLogo: true,
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeats-blackhoodie.png' },
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/ggbbeats-deephoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/ggbbeats-bluehoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: '/images/merch/ggbbeats-greyhoodie.png' },
            { id: 'purple', color: '#800080', label: 'Purple', image: '/images/merch/ggbbeats-purplehoodie.png' },
            { id: 'beige', color: '#f5f5dc', label: 'Beige', image: '/images/merch/ggbbeats-beigehoodie.png' }
        ]
    },
    {
        id: 'ggb-jersey',
        name: 'GGB Beats Jersey',
        price: 22.99,
        category: 'GGB Beats',
        tag: 'Artist Essential',
        isLogo: true,
        defaultColor: 'White',
        variants: [
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/ggbbeats-whitejersey.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeats-blackjersey.png' }
        ]
    },
    {
        id: 'ggb-children-logo-hoodie',
        name: 'GGB Beats Children Hoodie',
        price: 35.00,
        category: 'GGB Beats',
        tag: 'Kids Collection',
        isLogo: true,
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeats-children-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/ggbbeats-children-bluehoodie.png' },
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/ggbbeats-children-deephoodie.png' }
        ]
    },

    // --- 3. JOSS ---
    {
        id: 'joss-fantasma-sweatshirt',
        name: 'Fantasma Remix Sweatshirt',
        price: 45.00,
        category: 'Joss',
        tag: 'Official Merch',
        defaultColor: 'Military Green',
        variants: [
            { id: 'olive', color: '#3d3d22', label: 'Military Green', image: '/images/merch/jossfantasmaremix-olivesweatshirt.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/jossfantasmaremix-blacksweatshirt.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/jossfantasmaremix-bluesweatshirt.png' },
            { id: 'darkblue', color: '#00008b', label: 'Dark Blue', image: '/images/merch/jossfantasmaremix-darkbluesweatshirt.png' },
            { id: 'deepblue', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/jossfantasmaremix-deepsweatshirt.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: '/images/merch/jossfantasmaremix-greysweatshirt.png' }
        ]
    },
    {
        id: 'joss-volvere-hoodie',
        name: 'Volveré Hoodie',
        price: 55.00,
        category: 'Joss',
        tag: 'Artist signature',
        defaultColor: 'Maroon',
        variants: [
            { id: 'wine', color: '#722f37', label: 'Maroon', image: '/images/merch/jossvolvere-whinehoodie.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/jossvolvere-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/jossvolvere-bluehoodie.png' },
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/jossvolvere-deephoodie.png' },
            { id: 'green', color: '#004b23', label: 'Green', image: '/images/merch/jossvolvere-greenhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: '/images/merch/jossvolvere-greyhoodie.png' },
            { id: 'red', color: '#8b0000', label: 'Red', image: '/images/merch/jossvolvere-redhoodie.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/jossvolvere-whitehoodie.png' }
        ]
    },
    {
        id: 'joss-volvere-tank',
        name: 'Volveré Tank Top',
        price: 30.00,
        category: 'Joss',
        tag: 'Summer Special',
        defaultColor: 'Team Royal',
        variants: [
            { id: 'blue', color: '#0047ab', label: 'Team Royal', image: '/images/merch/jossvolvere-bluetanktop.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/jossvolvere-blacktanktop.png' },
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/jossvolvere-deeptanktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/jossvolvere-whitetanktop.png' }
        ]
    },

    // --- 4. RASTA MIA ---
    {
        id: 'rasta-dancing-hoodie',
        name: 'Dancing in the Shadows Crop Hoodie',
        price: 45.00,
        category: 'Rasta Mia',
        tag: 'New Collection',
        defaultColor: 'Storm',
        variants: [
            { id: 'grey', color: '#555555', label: 'Storm', image: '/images/merch/rastamiadancingintheshadow-crop-greyhoodie.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/rastamiadancingintheshadow-crop-blackhoodie.png' }
        ]
    },
    {
        id: 'rasta-barbie-hoodie',
        name: 'DJ Barbie Crop Hoodie',
        price: 57.00,
        category: 'Rasta Mia',
        tag: 'Featured',
        defaultColor: 'Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/rastamiadjbarbie-crop-blackhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Storm', image: '/images/merch/rastamiadjbarbie-crop-greyhoodie.png' }
        ]
    },
    {
        id: 'rasta-barbie-top',
        name: 'DJ Barbie Crop Top',
        price: 26.99,
        category: 'Rasta Mia',
        tag: 'Essential',
        defaultColor: 'Orchid',
        variants: [
            { id: 'lightpink', color: '#ffb7c5', label: 'Orchid', image: '/images/merch/rastamiadjbarbie-crop-lightpinktop.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/rastamiadjbarbie-crop-blacktop.png' },
            { id: 'pink', color: '#ff69b4', label: 'Pink', image: '/images/merch/rastamiadjbarbie-crop-pinktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/rastamiadjbarbie-crop-whitetop.png' }
        ]
    },

    // --- 5. GGB BEATS (GENERAL / ARTIST LINE) ---
    {
        id: 'ggb-children-gameplay',
        name: 'Gameplay M Children Hoodie',
        price: 28.99,
        category: 'GGB Beats',
        tag: 'Kids Collection',
        defaultColor: 'Navy Blazer',
        variants: [
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/ggbeatsgameplaym-children-deephoodie.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeatsgameplaym-children-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/ggbbeatsgameplaym-children-bluehoodie.png' }
        ]
    },
    {
        id: 'ggpad-sweatshirt',
        name: 'GG Pad Sweatshirt',
        price: 28.99,
        category: 'GGB Beats',
        tag: 'Signature Gear',
        defaultColor: 'Indigo Blue',
        variants: [
            { id: 'deep', color: '#0b132b', label: 'Indigo Blue', image: '/images/merch/ggbbeatsggpad-deepsweatshirt.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeatsggpad-blacksweatshirt.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: '/images/merch/ggbbeatsggpad-bluesweatshirt.png' },
            { id: 'cream', color: '#fffdd0', label: 'Cream', image: '/images/merch/ggbbeatsggpad-creamsweatshirt.png' },
            { id: 'darkblue', color: '#00008b', label: 'Dark Blue', image: '/images/merch/ggbbeatsggpad-darkbluesweatshirt.png' },
            { id: 'lightblue', color: '#add8e6', label: 'Light Blue', image: '/images/merch/ggbbeatsggpad-lightbluesweatshirt.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/ggbbeatsggpad-whitesweatshirt.png' }
        ]
    },
    {
        id: 'ggb-last-urban-x',
        name: 'Last Urban X Hoodie',
        price: 52.99,
        category: 'GGB Beats',
        tag: 'Collectors Series',
        defaultColor: 'Vintage Black',
        variants: [
            { id: 'black', color: '#000000', label: 'Vintage Black', image: '/images/merch/ggbbeatslasturbanx-blackhoodie-front.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep Blue', image: '/images/merch/ggbbeatslasturbanx-deephoodie-front.png' },
            { id: 'green', color: '#004b23', label: 'Green', image: '/images/merch/ggbbeatslasturbanx-greenhoodie-front.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: '/images/merch/ggbbeatslasturbanx-greyhoodie-front.png' },
            { id: 'lightgrey', color: '#d3d3d3', label: 'Light Grey', image: '/images/merch/ggbbeatslasturbanx-lightgreyhoodie-front.png' },
            { id: 'solidgrey', color: '#a9a9a9', label: 'Solid Grey', image: '/images/merch/ggbbeatslasturbanx-solidgreyhoodie-front.png' }
        ]
    },
    {
        id: 'ggb-urban-x-crop',
        name: 'Urban X Crop Hoodie',
        price: 45.00,
        category: 'GGB Beats',
        tag: 'Limited Trend',
        defaultColor: 'Military Green',
        variants: [
            { id: 'olive', color: '#3d3d22', label: 'Military Green', image: '/images/merch/ggbbeatsurbanx-crop-olivehoodie.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeatsurbanx-crop-blackhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: '/images/merch/ggbbeatsurbanx-crop-greyhoodie.png' }
        ]
    },
    {
        id: 'ggb-oldies-tank',
        name: "Oldies' Summer Tank Top",
        price: 30.00,
        category: 'GGB Beats',
        tag: 'Summer Vibe',
        defaultColor: 'Navy Blazer',
        variants: [
            { id: 'deep', color: '#0b132b', label: 'Navy Blazer', image: '/images/merch/ggbbeatsoldiessummer-deeptanktop.png' },
            { id: 'black', color: '#000000', label: 'Black', image: '/images/merch/ggbbeatsoldiessummer-blacktanktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: '/images/merch/ggbbeatsoldiessummer-whitetanktop.png' }
        ]
    },
    {
        id: 'ggb-targan-shirt',
        name: '90s Raglan Shirt',
        price: 24.99,
        category: 'GGB Beats',
        tag: 'Retro Style',
        defaultColor: 'White/Black',
        variants: [
            { id: 'whiteblack', color: '#ffffff', label: 'White/Black', image: '/images/merch/ggbbeats90s-wbtarganshirt.png' },
            { id: 'blackwhite', color: '#000000', label: 'Black/White', image: '/images/merch/ggbbeats90s-bwtarganshirt.png' }
        ]
    }
];

// Transforma la lista simple en la estructura rica de tienda (Opciones + Variantes)
function getStoreCatalog() {
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];

    return merchProducts.map(p => {
        const isHat = p.isHat || p.name.toLowerCase().includes('hat') || p.name.toLowerCase().includes('cap');
        
        // Colores ordenados con el color por defecto al principio
        let colorLabels = p.variants.map(v => v.label);
        if (p.defaultColor && colorLabels.includes(p.defaultColor)) {
            colorLabels = [p.defaultColor, ...colorLabels.filter(c => c !== p.defaultColor)];
        }

        const options = [{ name: 'Color', values: colorLabels }];
        if (!isHat) {
            options.push({ name: 'Size', values: defaultSizes });
        }

        const variants = [];
        p.variants.forEach(v => {
            if (isHat) {
                variants.push({
                    id: `${p.id}-${v.id}`,
                    title: v.label,
                    price: { amount: p.price.toFixed(2), currencyCode: 'USD' },
                    selectedOptions: [{ name: 'Color', value: v.label }],
                    image: { src: v.image }
                });
            } else {
                defaultSizes.forEach(size => {
                    variants.push({
                        id: `${p.id}-${v.id}-${size.toLowerCase()}`,
                        title: `${v.label} / ${size}`,
                        price: { amount: p.price.toFixed(2), currencyCode: 'USD' },
                        selectedOptions: [
                            { name: 'Color', value: v.label },
                            { name: 'Size', value: size }
                        ],
                        image: { src: v.image }
                    });
                });
            }
        });

        // Tags para orden y filtros
        const tags = [
            p.category.toLowerCase(),
            p.name.toLowerCase()
        ];
        if (p.isLogo || (p.category === 'GGB Beats' && (p.name.toLowerCase().includes('logo') || p.name.toLowerCase().includes('adidas') || p.isHat || p.id === 'ggb-jersey' || p.id === 'ggb-hoodie' || p.id === 'ggb-children-logo-hoodie'))) {
            tags.push('ggb beats logo');
        }

        return {
            id: p.id,
            title: p.name,
            vendor: p.category,
            productType: p.tag || p.category,
            tags: tags,
            images: p.variants.map(v => ({ src: v.image })),
            options: options,
            variants: variants,
            defaultColor: p.defaultColor || colorLabels[0]
        };
    });
}

// Exportación global para navegadores y módulos
if (typeof window !== 'undefined') {
    window.merchProducts = merchProducts;
    window.getStoreCatalog = getStoreCatalog;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { merchProducts, getStoreCatalog };
}
