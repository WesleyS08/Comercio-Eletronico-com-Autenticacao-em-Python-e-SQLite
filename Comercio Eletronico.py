import sqlite3

db = sqlite3.connect('banco_de_dados.db')
cursor = db.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, senha TEXT)")
db.commit()

precosProdutos = {
    'Camisa': 20,
    'Tenis': 50,
    'Relogio': 30,
}


class SistemaAutenticacao:
    def __init__(self, db):
        self.db = db

    def autenticarUsuario(self, usuario, senha):
        sql = "SELECT * FROM usuarios WHERE nome = ? AND senha = ?"
        cursor.execute(sql, (usuario, senha))
        row = cursor.fetchone()
        if row:
            print(f"Autenticando usuário {usuario}...")
            return True
        else:
            print('Falha na autenticação')
            return False


class SistemaCadastro:
    def __init__(self, db):
        self.db = db

    def cadastrarUsuario(self, usuario, senha):
        sql = "INSERT INTO usuarios (nome, senha) VALUES (?, ?)"
        try:
            cursor.execute(sql, (usuario, senha))
            db.commit()
            print(f'Usuário {usuario} cadastrado com sucesso.')
            return True
        except sqlite3.Error as e:
            print("Erro ao cadastrar usuário:", e)
            return False


class Cliente:
    def __init__(self, db):
        self.db = db
        self.autenticacao = SistemaAutenticacao(db)
        self.cadastro = SistemaCadastro(db)

    def realizarAtendimento(self):
        print('Seja Bem-vindo ao comércio eletrônico')
        self.menuPrincipal()

    def criarPedidoFicticio(self, usuario, produtosSelecionados):
        print(f'\nPedido do {usuario} criado com sucesso....')
        print(f'\nItens do pedido: {", ".join(produtosSelecionados)}')

        valorTotal = 0

        for produto in produtosSelecionados:
            if produto in precosProdutos:
                valorItem = precosProdutos[produto]
                valorTotal += valorItem
                print(f"- {produto}: ${valorItem}")

        print(f'\nValor total do pedido: ${valorTotal}')

    def menuPrincipal(self):
        print('\nEscolha uma opção abaixo: ')
        opcao = input('Opção 1: Criar conta\nOpção 2: Fazer Login\n')
        opcao = int(opcao)

        if opcao == 1:
            print('Você selecionou criar conta...')
            usuario = input('Digite o nome de usuário: ')
            senha = input('Digite a senha: ')
            if self.cadastro.cadastrarUsuario(usuario, senha):
                print('\nCadastro realizado com sucesso')
            else:
                print('Falha no cadastro')
            self.menuPrincipal()
        elif opcao == 2:
            print('Você selecionou fazer login...\n')
            usuario = input('Digite o nome de usuário: ')
            senha = input('Digite a senha: ')
            if self.autenticacao.autenticarUsuario(usuario, senha):
                print('Login realizado com sucesso\n')
                opcao = input('Opção 1: Criar pedido\nOpção 2: Sair\n')
                opcao = int(opcao)

                if opcao == 1:
                    print('Você selecionou criar pedido fictício...')
                    print('Produtos fictícios disponíveis: Camisa, Tenis, Relogio')
                    produtos = input('Digite os produtos do pedido (separados por vírgula): ')
                    produtosArray = [prod.strip() for prod in produtos.split(',')]
                    self.criarPedidoFicticio(usuario, produtosArray)
                elif opcao == 2:
                    print('\nSaindo....')
                else:
                    print('Escolha inválida')
            else:
                print('\nUsuário ou senha incorretos')
        else:
            print('Escolha inválida')

cliente1 = Cliente(db)
cliente1.realizarAtendimento()
