const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const { exec } = require('child_process');

const db = new sqlite3.Database('banco_de_dados.db');

db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, senha TEXT)");
});

const precosProdutos = {
    Camisa: 20,     
    Tenis: 50,      
    Relogio: 30,    
};


class SistemaAutenticacao {
    constructor(db) {
        this.db = db;
    }

    autenticarUsuario(usuario, senha, callback) {
        const sql = "SELECT * FROM usuarios WHERE nome = ? AND senha = ?";
        this.db.get(sql, [usuario, senha], (err, row) => {
            if (err) {
                console.error("Erro na consulta SQL: " + err);
                callback(false);
            }
            if (row) {
                console.log(`Autenticando usuário ${usuario}...`);
                callback(true);
            } else {
                console.log('Falha na autenticação');
                callback(false);
            }
        });
    }
}

class SistemaCadastro {
    constructor(db) {
        this.db = db;
    }

    cadastrarUsuario(usuario, senha, callback) {
        const sql = "INSERT INTO usuarios (nome, senha) VALUES (?, ?)";
        this.db.run(sql, [usuario, senha], function (err) {
            if (err) {
                console.error("Erro ao cadastrar usuário: " + err);
                callback(false);
            } else {
                console.log(`Usuário ${usuario} cadastrado com sucesso.`);
                callback(true);
            }
        });
    }
}

class Cliente {
    constructor(db) {
        this.db = db;
        this.autenticacao = new SistemaAutenticacao(db);
        this.cadastro = new SistemaCadastro(db);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    realizarAtendimento() {
        console.log('Seja Bem-vindo ao comércio eletrônico');
        this.menuPrincipal();
    }

    criarPedidoFicticio(usuario, produtosSelecionados) {
        console.log(`\nPedido do ${usuario} criado com sucesso....`);
        console.log(`\nItens do pedido: ${produtosSelecionados.join(', ')}`);

        let valorTotal = 0;

        produtosSelecionados.forEach((produto) => {
            if (precosProdutos[produto]) {
                const valorItem = precosProdutos[produto];
                valorTotal += valorItem;
                console.log(`- ${produto}: $${valorItem}`);
            }
        });

        console.log(`\nValor total do pedido: $${valorTotal}`);
    }


    menuPrincipal() {
        console.log('\nEscolha uma opção abaixo: ');
        this.rl.question('\nOpção 1: Criar conta\nOpção 2: Fazer Login\n', (opcao) => {
            opcao = parseInt(opcao);
            switch (opcao) {
                case 1:
                    console.log('Você selecionou criar conta...');
                    this.rl.question('\nDigite o nome de usuário: ', (usuario) => {
                        this.rl.question('\nDigite a senha: ', (senha) => {
                            this.cadastro.cadastrarUsuario(usuario, senha, (sucesso) => {
                                if (sucesso) {
                                    console.log('\nCadastro realizado com sucesso');
                                } else {
                                    console.log('Falha no cadastro');
                                }
                                this.menuPrincipal();
                            });
                        });
                    });
                    break;
                case 2:
                    console.log('Você selecionou fazer login...\n');
                    this.rl.question('Digite o nome de usuário: ', (usuario) => {
                        this.rl.question('\nDigite a senha: ', (senha) => {
                            this.autenticacao.autenticarUsuario(usuario, senha, (sucesso) => {
                                if (sucesso) {
                                    console.log('Login realizado com sucesso\n');
                                    this.rl.question('Opção 1: Criar pedido\nOpção 2: Sair\n', (opcao) => {
                                        opcao = parseInt(opcao);
                                        switch (opcao) {
                                            case 1:
                                                console.log('Você selecionou criar pedido fictício...');
                                                console.log('Produtos fictícios disponíveis: Camisa, Tenis, Relogio');
                                                this.rl.question('Digite os  produtos do pedido (separados por vírgula): ', (produtos) => {
                                                    const produtosArray = produtos.split(',').map(prod => prod.trim());
                                                    this.criarPedidoFicticio(usuario, produtosArray);
                                                    this.rl.close();
                                                });
                                                break;
                                            case 2:
                                                console.log('\nSaindo....');
                                                this.rl.close();
                                                break;
                                            default:
                                                console.log('Escolha inválida');
                                                this.rl.close();
                                        }
                                    });
                                } else {
                                    console.log('\nUsuário ou senha incorretos');
                                    this.rl.close();
                                }
                            });
                        });
                    });
                    break;
                default:
                    console.log('Escolha inválida');
                    this.rl.close();
            }
        });
    }
}

const cliente1 = new Cliente(db);
cliente1.realizarAtendimento();
