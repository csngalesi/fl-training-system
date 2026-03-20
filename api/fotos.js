const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    try {
        // Encontra o caminho absoluto onde as fotos estão hospedadas dentro do Vercel
        const directoryPath = path.join(process.cwd(), 'Aniversario', 'fotos');
        
        // Se a pasta não existir, retorna um array vazio
        if (!fs.existsSync(directoryPath)) {
            return res.status(200).json([]);
        }

        const files = fs.readdirSync(directoryPath);
        
        // Filtra apenas arquivos que são imagens
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        
        // Mapeia para o caminho relativo que o HTML usa
        const fullPaths = imageFiles.map(f => `Aniversario/fotos/${f}`);
        
        res.status(200).json(fullPaths);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao ler a pasta', detalhes: err.message });
    }
}
