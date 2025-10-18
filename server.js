import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve os arquivos da pasta public (como o index.html)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post('/corrigir', async (req, res) => {
  try {
    const { texto } = req.body;

    const prompt = `
    Você é um corretor experiente de redações do ENEM.  
    Sua tarefa é avaliar a redação abaixo de acordo com as 5 competências oficiais do ENEM, atribuindo notas de 0 a 200 em cada uma, e uma nota final de 0 a 1000.  
    Baseie-se nos critérios oficiais, mas apresente explicações claras, resumidas e objetivas para cada competência.

    Critérios resumidos:

    1 **Domínio da norma culta da língua portuguesa:**  
    Avalie ortografia, pontuação, concordância, regência, crase, uso de pronomes e clareza.  
    - 200: excelente domínio, com erros mínimos.  
    - 160: bom domínio, poucos erros.  
    - 120: domínio mediano, erros recorrentes.  
    - 80: muitos erros que comprometem a leitura.  
    - 40 ou menos: texto com sérios desvios da norma padrão.

    2 **Compreensão do tema e adequação à proposta:**  
    Verifique se o candidato desenvolve o tema proposto, mantendo-se dentro do gênero dissertativo-argumentativo.  
    - 200: desenvolve o tema com consistência e profundidade.  
    - 160: bom desenvolvimento, mas com pequenas limitações.  
    - 120: abordagem previsível ou superficial.  
    - 80: tangencia o tema ou copia os textos motivadores.  
    - 40 ou menos: fuga total ao tema.

    3 **Seleção e organização de argumentos:**  
    Avalie a coerência, relevância e estrutura lógica dos argumentos apresentados.  
    - 200: argumentos consistentes, claros e bem estruturados.  
    - 160: argumentos bons, mas com alguma limitação.  
    - 120: argumentos medianos, pouco desenvolvidos.  
    - 80: argumentos frágeis ou desorganizados.  
    - 40 ou menos: ideias desconexas ou incoerentes.

    4 **Coesão e coerência textual:**  
    Observe o uso de conectivos, pronomes e outros elementos coesivos que garantem fluidez entre frases e parágrafos.  
    - 200: coesão excelente, transições naturais.  
    - 160: boas conexões, com poucas falhas.  
    - 120: coesão razoável, mas com repetições ou falhas.  
    - 80: coesão fraca e pouco articulada.  
    - 40 ou menos: texto fragmentado e desconexo.

    5 **Proposta de intervenção e respeito aos direitos humanos:**  
    Avalie se há uma proposta concreta e viável para o problema apresentado, respeitando os direitos humanos.  
    - 200: proposta detalhada, viável e articulada com o texto.  
    - 160: proposta boa, mas pouco detalhada.  
    - 120: proposta genérica ou pouco articulada.  
    - 80: proposta vaga ou desconectada.  
    - 40 ou menos: ausência ou proposta incoerente.

    Agora, avalie a redação a seguir e retorne o resultado **neste formato**:

    Competência 1: [nota] - [comentário]  
    Competência 2: [nota] - [comentário]  
    Competência 3: [nota] - [comentário]  
    Competência 4: [nota] - [comentário]  
    Competência 5: [nota] - [comentário]  
    **Nota final:** [soma das cinco notas]

    Redação:
    ${texto}
    `;

    const resposta = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ analise: resposta.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Falha ao processar a redação.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
