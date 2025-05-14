# Gerenciador do Freezer

Uma aplicação moderna para gerenciar o conteúdo do seu freezer, permitindo adicionar, remover, modificar e buscar itens de forma fácil e intuitiva através de uma interface touch screen.

## Características

- Interface touch-screen otimizada
- Gerenciamento completo de itens (CRUD)
- Busca e filtragem por categorias
- Design responsivo e moderno
- Suporte a múltiplas gavetas e seções
- Categorização de itens

## Tecnologias Utilizadas

- React 18
- TypeScript
- Material-UI (MUI)
- Vite
- Zustand (Gerenciamento de Estado)

## Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/freezer-manager.git
cd freezer-manager
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Abra o navegador em `http://localhost:3000`

## Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
# ou
yarn build
```

Os arquivos de build estarão na pasta `dist`.

## Estrutura do Projeto

```
src/
  ├── components/        # Componentes React
  ├── store/            # Estado global (Zustand)
  ├── types/            # Tipos TypeScript
  ├── App.tsx           # Componente principal
  └── main.tsx          # Ponto de entrada
```

## Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 