const merchProducts = [
    {
        id: 'myooz-hoodie',
        name: 'MYOOZ InC Hoodie',
        price: 44.99,
        category: 'MYOOZ InC',
        tag: 'Signature Merch',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/myoozinc-hoodie.png' }
        ]
    },
    {
        id: 'myooz-jersey',
        name: 'MYOOZ InC Jersey',
        price: 22.99,
        category: 'MYOOZ InC',
        tag: 'Classic Essential',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/myoozinc-jersey-black.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/myoozinc-jersey-white.png' }
        ]
    },
    {
        id: 'ggb-jersey',
        name: 'GGB Beats Jersey',
        price: 40.00,
        category: 'GGB Beats',
        tag: 'Artist Essential',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeats-blackjersey.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeats-whitejersey.png' }
        ]
    },
    {
        id: 'ggb-hoodie',
        name: 'GGB Beats Hoodie',
        price: 55.00,
        category: 'GGB Beats',
        tag: 'Premium Collection',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeats-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/ggbbeats-bluehoodie.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep Blue', image: 'images/merch/ggbbeats-deephoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/ggbbeats-greyhoodie.png' },
            { id: 'purple', color: '#800080', label: 'Purple', image: 'images/merch/ggbbeats-purplehoodie.png' },
            { id: 'beige', color: '#f5f5dc', label: 'Beige', image: 'images/merch/ggbbeats-beigehoodie.png' }
        ]
    },
    {
        id: 'ggpad-sweatshirt',
        name: 'GG Pad Sweatshirt',
        price: 45.00,
        category: 'GGB Beats',
        tag: 'Signature Gear',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatsggpad-blacksweatshirt.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/ggbbeatsggpad-bluesweatshirt.png' },
            { id: 'cream', color: '#fffdd0', label: 'Cream', image: 'images/merch/ggbbeatsggpad-creamsweatshirt.png' },
            { id: 'darkblue', color: '#00008b', label: 'Dark Blue', image: 'images/merch/ggbbeatsggpad-darkbluesweatshirt.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep', image: 'images/merch/ggbbeatsggpad-deepsweatshirt.png' },
            { id: 'lightblue', color: '#add8e6', label: 'Light Blue', image: 'images/merch/ggbbeatsggpad-lightbluesweatshirt.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeatsggpad-whitesweatshirt.png' }
        ]
    },
    {
        id: 'ggb-urban-x-crop',
        name: 'Urban X Crop Hoodie',
        price: 45.00,
        category: 'GGB Beats',
        tag: 'Limited Trend',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatsurbanx-crop-blackhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/ggbbeatsurbanx-crop-greyhoodie.png' },
            { id: 'olive', color: '#3d3d22', label: 'Olive', image: 'images/merch/ggbbeatsurbanx-crop-olivehoodie.png' }
        ]
    },
    {
        id: 'ggb-oldies-tank',
        name: "Oldies' Summer Tank Top",
        price: 30.00,
        category: 'GGB Beats',
        tag: 'Summer Vibe',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatsoldiessummer-blacktanktop.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep Blue', image: 'images/merch/ggbbeatsoldiessummer-deeptanktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeatsoldiessummer-whitetanktop.png' }
        ]
    },
    {
        id: 'ggb-targan-shirt',
        name: '90s Targan Shirt',
        price: 35.00,
        category: 'GGB Beats',
        tag: 'Retro Style',
        variants: [
            { id: 'blackwhite', color: '#000000', label: 'B/W', image: 'images/merch/ggbbeats90s-bwtarganshirt.png' },
            { id: 'whiteblack', color: '#ffffff', label: 'W/B', image: 'images/merch/ggbbeats90s-wbtarganshirt.png' }
        ]
    },
    {
        id: 'ggb-adidas-hat',
        name: 'GGB Beats Adidas Hat',
        price: 25.00,
        category: 'GGB Beats',
        tag: 'Sportswear',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeats-adidas-blackhat.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeats-adidas-whitehat.png' }
        ]
    },
    {
        id: 'ggb-standard-hat',
        name: 'GGB Beats Beanie',
        price: 25.00,
        category: 'GGB Beats',
        tag: 'Accessory',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeats-blackhat.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeats-whitehat.png' }
        ]
    },
    {
        id: 'joss-fantasma-sweatshirt',
        name: 'Fantasma Remix Sweatshirt',
        price: 45.00,
        category: 'Joss',
        tag: 'Official Merch',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/jossfantasmaremix-blacksweatshirt.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/jossfantasmaremix-bluesweatshirt.png' },
            { id: 'deepblue', color: '#0b132b', label: 'Deep Blue', image: 'images/merch/jossfantasmaremix-deepsweatshirt.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/jossfantasmaremix-greysweatshirt.png' },
            { id: 'olive', color: '#3d3d22', label: 'Olive', image: 'images/merch/jossfantasmaremix-olivesweatshirt.png' }
        ]
    },
    {
        id: 'joss-volvere-hoodie',
        name: 'Volveré Hoodie',
        price: 55.00,
        category: 'Joss',
        tag: 'Artist signature',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/jossvolvere-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/jossvolvere-bluehoodie.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep', image: 'images/merch/jossvolvere-deephoodie.png' },
            { id: 'green', color: '#004b23', label: 'Green', image: 'images/merch/jossvolvere-greenhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/jossvolvere-greyhoodie.png' },
            { id: 'red', color: '#8b0000', label: 'Red', image: 'images/merch/jossvolvere-redhoodie.png' },
            { id: 'wine', color: '#722f37', label: 'Wine', image: 'images/merch/jossvolvere-whinehoodie.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/jossvolvere-whitehoodie.png' }
        ]
    },
    {
        id: 'joss-volvere-tank',
        name: 'Volveré Tank Top',
        price: 30.00,
        category: 'Joss',
        tag: 'Summer Special',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/jossvolvere-blacktanktop.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/jossvolvere-bluetanktop.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep', image: 'images/merch/jossvolvere-deeptanktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/jossvolvere-whitetanktop.png' }
        ]
    },
    {
        id: 'rasta-dancing-hoodie',
        name: 'Dancing in the Shadow Crop Hoodie',
        price: 45.00,
        category: 'Rasta Mia',
        tag: 'New Collection',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/rastamiadancingintheshadow-crop-blackhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/rastamiadancingintheshadow-crop-greyhoodie.png' }
        ]
    },
    {
        id: 'rasta-barbie-hoodie',
        name: 'DJ Barbie Crop Hoodie',
        price: 45.00,
        category: 'Rasta Mia',
        tag: 'Featured',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/rastamiadjbarbie-crop-blackhoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/rastamiadjbarbie-crop-greyhoodie.png' }
        ]
    },
    {
        id: 'rasta-barbie-top',
        name: 'DJ Barbie Crop Top',
        price: 35.00,
        category: 'Rasta Mia',
        tag: 'Essential',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/rastamiadjbarbie-crop-blacktop.png' },
            { id: 'lightpink', color: '#ffb7c5', label: 'Light Pink', image: 'images/merch/rastamiadjbarbie-crop-lightpinktop.png' },
            { id: 'pink', color: '#ff69b4', label: 'Pink', image: 'images/merch/rastamiadjbarbie-crop-pinktop.png' },
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/rastamiadjbarbie-crop-whitetop.png' }
        ]
    },
    {
        id: 'ggb-hat',
        name: 'GGB Beats Hat',
        price: 25.00,
        category: 'GGB Beats',
        tag: 'Accessory',
        variants: [
            { id: 'white', color: '#ffffff', label: 'White', image: 'images/merch/ggbbeats-hat.png' }
        ]
    },
    {
        id: 'ggb-last-urban-x',
        name: 'Last Urban X Hoodie',
        price: 65.00,
        category: 'GGB Beats',
        tag: 'Collectors Series',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatslasturbanx-blackhoodie-front.png' },
            { id: 'deep', color: '#0b132b', label: 'Deep Blue', image: 'images/merch/ggbbeatslasturbanx-deephoodie-front.png' },
            { id: 'green', color: '#004b23', label: 'Green', image: 'images/merch/ggbbeatslasturbanx-greenhoodie-front.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/ggbbeatslasturbanx-greyhoodie-front.png' },
            { id: 'beige', color: '#f5f5dc', label: 'Beige', image: 'images/merch/ggbbeatslasturbanx-beigehoodie-front.png' },
            { id: 'purple', color: '#800080', label: 'Purple', image: 'images/merch/ggbbeats-purplehoodie.png' }
        ]
    },
    {
        id: 'ggb-children-urban-x',
        name: 'GGB Urban X Children Hoodie',
        price: 39.99,
        category: 'GGB Beats',
        tag: 'Kids Collection',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatsurbanx-children-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/ggbbeatsurbanx-children-bluehoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/ggbbeatsurbanx-children-greyhoodie.png' }
        ]
    },
    {
        id: 'ggb-children-gameplay',
        name: 'Gameplay M Children Hoodie',
        price: 39.99,
        category: 'GGB Beats',
        tag: 'Kids Collection',
        variants: [
            { id: 'black', color: '#000000', label: 'Black', image: 'images/merch/ggbbeatsgameplaym-children-blackhoodie.png' },
            { id: 'blue', color: '#0047ab', label: 'Blue', image: 'images/merch/ggbbeatsgameplaym-children-bluehoodie.png' },
            { id: 'grey', color: '#555555', label: 'Grey', image: 'images/merch/ggbbeatsgameplaym-children-greyhoodie.png' }
        ]
    }
];
