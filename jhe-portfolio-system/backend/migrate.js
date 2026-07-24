const pool = require('./config/db');

async function migrate() {
    try {
        console.log('Iniciando criação da tabela timeline_events...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS timeline_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                year VARCHAR(10) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                display_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if empty before inserting
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM timeline_events');
        if (rows[0].count === 0) {
            console.log('Inserindo 17 marcos históricos...');
            const insertQuery = `
                INSERT INTO timeline_events (id, year, title, description, display_order) VALUES
                (1, '1995', 'O início', 'Nossa história tem início em 1995 quando os engenheiros civis Hélio Alves de Azeredo Junior e João Alberto Viol fundaram a JHE Consultores Associados, para atuar de forma especializada em serviços de engenharia e gerenciamento de empreendimentos.', 1),
                (2, '1995', 'Primeiro contrato', 'O primeiro contrato da JHE foi uma consultoria para um relatório do Banco Mundial sobre a situação do Saneamento no Brasil. A partir desse primeiro trabalho, sob responsabilidade do sócio João Alberto Viol, a JHE foi se desenvolvendo com objetivo de gerenciar e fiscalizar obras, elaborar projetos, pesquisar e planejar serviços para apoio na implantação de políticas públicas, em instâncias municipais e estaduais.', 2),
                (3, '1996', 'Desenvolvendo a área de saneamento', 'Desde a consultoria para o Banco Mundial, os trabalhos na área de saneamento estiveram presentes na JHE. Os primeiros projetos foram executados para a Sabesp, tanto em abastecimento de água quanto em coleta e tratamento de esgoto.', 3),
                (4, '1998', 'Certificações', 'Focada na busca pela excelência, a JHE conquistou a certificação ISO de qualidade, resultando na padronização e melhoria contínua de seus produtos e processos, para melhor atendimento aos requisitos dos clientes. Entendendo o potencial competitivo, iniciou sua capacitação para certificação em Meio Ambiente, Segurança e Saúde Ocupacional.', 4),
                (5, '2000', 'Desenvolvendo a área habitacional', 'Ainda como empresa sub-contratada, a JHE realizou o primeiro gerenciamento de obras habitacionais. Com o sucesso do primeiro contrato, que tinha o sócio Hélio como coordenador e aconteceu na região de Marilia e Presidente Prudente, a JHE adquiriu atestados e conquistou o certificado Qualihab, passando a participar das concorrências de gerenciamento de obras habitacionais do CDHU.', 5),
                (6, '2001', 'Início das atividades em gestão social', 'A partir daí começou um extenso trabalho de apoio e atendimento à população vulnerável no desenvolvimento de políticas de habitação, com interesse social. Foram entregues dezenas de empreendimentos pela CDHU, com milhares de unidades habitacionais, todos com acompanhamento e atendimento social da JHE, trazendo desenvolvimento e qualidade de vida para as comunidades da região.', 6),
                (7, '2001', 'Expertise em manutenção escolar', 'A JHE também atuou no gerenciamento de manutenção preventiva e corretiva da rede pública escolar. Tendo como alicerce a experiência prévia dos sócios na área, a JHE demonstrou diferencial competitivo no rigoroso acompanhamento de obras escolares, desde a contratação do projeto até a sua conclusão, atestando a qualidade das obras e oferecendo à sociedade um ambiente escolar seguro, funcional e agradável.', 7),
                (8, '2002', 'Uso da tecnologia para inspeção de redes', 'Sempre em busca de diversificação tecnológica, em meados de 2002 a JHE inovou novamente, trazendo soluções diferenciadas para a área de saneamento. Em parceria com uma empresa alemã, passamos a realizar a inspeção de redes de esgotos por televisionamento, em contratos financiados pelo banco Interamericano de Desenvolvimento, na Sabesp.', 8),
                (9, '2005', 'Serviços técnicos', 'Com soluções tecnológicas associadas à experiência, a JHE atuou na revisão, especificações técnicas e atualização de Banco de preços de insumos para serviços de obras em órgãos públicos.', 9),
                (10, '2008', 'Obras para um mundo sustentável', 'Inovando em sustentabilidade, a JHE validou processos de despoluição e combate às perdas em bacias hidrográficas, consideradas críticas no estado de São Paulo; Atuou como agentes verificadores para o Banco Mundial; No gerenciamento ambiental das obras do Metrô; Na supervisão, monitoramento e coordenação de ações e no acompanhamento Ambiental de Rodovias nas obras do Rodoanel e Jacu Pêssego.', 10),
                (11, '2009', 'Demonstrativo Com + Água', 'O projeto-piloto no combate ao desperdício de água e energia foi realizado pela JHE em parceria com a Fundação Instituto de Administração da USP. O “Demonstrativo Com + Água” foi um projeto piloto no Brasil, contratado pela secretaria nacional de saneamento para servir de modelo a Estados e Municípios do país no combate as perdas de água e ao desperdício do uso de energia e despesas operacionais.', 11),
                (12, '2009', 'Ampliação do conceito de moradia e recuperação urbana', 'Consolidamos novos marcos conceituais nos programas de provisão das habitações, não apenas como abrigos de família, mas como espaços sustentáveis de ocupação permanente. Em projetos de Recuperação Urbana, normatizamos padrões de mediação, atendimento técnico e humanizado para os casos de reassentamento de famílias em situação de remoção involuntária.', 12),
                (13, '2009', 'Princípios e diretrizes normatizados para o Trabalho Técnico Social', 'As experiências da JHE passaram a incorporar as diretrizes da Política Habitacional de Interesse Social (PHIS). A partir de 2009, através de novas definições para os programas de provisão habitacional, intervenções de urbanização e reassentamento de favelas, o trabalho social da JHE se desenvolveu em caráter plural, contemplando indivíduos heterogêneos, considerando também os resultados de um processo de monitoramento permanente e os ajustes necessários em cada etapa do trabalho.', 13),
                (14, '2017', 'Compliance', 'Para assegurar a conformidade da empresa em relação à legislação, normas, regras, procedimentos e disposições contratuais, foi constituído em 2017 o Núcleo de Compliance, responsável pela implementação do Programa de Integridade da JHE.', 14),
                (15, '2018', 'Olhar para o futuro', 'É por fazer cotidianamente esse exercício de atualização e melhoria contínua, que a JHE Engenharia realizou uma parceria com a ICV Brasil, empresa que atua em inspeção, certificação e vistoria de produtos, processos e serviços.', 15),
                (16, '2020', 'Reestruturação JHE', 'A constante busca pela excelência resultou em processo de reestruturação organizacional, com ênfase em gestão do conhecimento, intensificação do uso da tecnologia em suas soluções e constituição da Diretoria de Operações Sociais.', 16),
                (17, '2025', 'JHE: Destaque em todas as áreas de atuação!', 'Em sua história, a JHE evoluiu de forma sustentável e inovadora, sendo referência em suas diversas áreas de atuação.', 17);
            `;
            await pool.query(insertQuery);
            console.log('17 marcos inseridos com sucesso!');
        } else {
            console.log('Tabela já contém dados, ignorando inserção.');
        }

        console.log('Tabela timeline_events criada e semeada com sucesso!');
    } catch (e) {
        console.error('Erro na migração:', e);
    } finally {
        process.exit();
    }
}
migrate();
