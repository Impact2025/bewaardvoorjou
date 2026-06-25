-- Update kennisbank artikel: "Hoe begin ik met mijn levensverhaal?"
-- Voer uit via Railway dashboard > Data > SQL Query
-- Of: railway run psql < admin/update-kennisbank-hoe-begin-ik.sql

UPDATE blogpost SET
    content = E'[HIER DE INHOUD VAN content/hoe-begin-ik-levensverhaal-vastleggen-uitgebreid.md ZONDER YAML]',
    meta_title = 'Hoe begin ik met mijn levensverhaal? Stap-voor-stap gids',
    meta_description = 'Je levensverhaal vastleggen in 5 eenvoudige stappen. Geen schrijfervaring nodig. Start vandaag met een herinnering. Gratis.'
WHERE id = '10c20006-db63-4b8a-a933-b84c81d21a78';

-- Controleer
SELECT id, LENGTH(content), meta_title FROM blogpost WHERE id = '10c20006-db63-4b8a-a933-b84c81d21a78';
