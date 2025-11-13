# 🚀 Deploy com GitHub Actions

Este projeto usa GitHub Actions para fazer deploy automático no Azure Static Web Apps.

## 📋 Pré-requisitos

### 1. Secret do Azure no GitHub

O workflow precisa do token de API do Azure Static Web Apps configurado como secret no GitHub:

1. Vá em: `https://github.com/SEU_USUARIO/SEU_REPO/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Nome: `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Valor: Token de deploy do Azure Static Web Apps

#### Como obter o token do Azure:

1. Acesse o [Portal do Azure](https://portal.azure.com)
2. Navegue até seu Static Web App
3. Vá em **Settings > Configuration**
4. Copie o **deployment token**

## 🔄 Como funciona

### Deploy Automático

O deploy acontece automaticamente quando você faz:

```bash
git add .
git commit -m "Suas alterações"
git push origin master
```

### Processo do Workflow

1. ✅ **Checkout** - Baixa o código
2. 📦 **Setup Node.js** - Configura Node.js 18.19.0
3. 💾 **Cache** - Usa cache para acelerar instalação
4. 📥 **Install** - Instala dependências (`npm ci`)
5. 🔍 **Type Check** - Verifica erros de TypeScript
6. 🏗️ **Build** - Compila para produção
7. ✅ **Verify** - Verifica se build foi criado
8. 🚀 **Deploy** - Envia para Azure Static Web Apps
9. 🎉 **Success** - Mostra URL de deploy

## 📊 Visualizar Deploy

### No GitHub:

1. Vá em: `https://github.com/SEU_USUARIO/SEU_REPO/actions`
2. Veja o status do workflow em tempo real
3. Logs completos de cada etapa

### Status Badge (opcional):

Adicione ao README.md:

```markdown
![Deploy Status](https://github.com/SEU_USUARIO/SEU_REPO/workflows/Azure%20Static%20Web%20Apps%20CI%2FCD/badge.svg)
```

## 🛠️ Melhorias implementadas

### ✨ Versões atualizadas:
- `actions/checkout@v4` - Checkout mais rápido
- `actions/setup-node@v4` - Node.js setup atualizado
- Node.js `18.19.0` - Versão LTS específica

### 🚀 Performance:
- **Cache de npm** - Reutiliza dependências entre builds
- **`npm ci`** - Instalação mais rápida e confiável
- **Memory limit** - 4GB para evitar crashes em builds grandes

### 🔒 Qualidade:
- **TypeScript check** - Garante código sem erros de tipo
- **Build verification** - Verifica se arquivos foram gerados
- **Error handling** - Para o deploy se houver erros

### 📝 Transparência:
- **Lista arquivos** - Mostra o que foi buildado
- **URL de deploy** - Exibe onde foi publicado
- **Logs detalhados** - Fácil debug de problemas

## 🔧 Troubleshooting

### Erro: "AZURE_STATIC_WEB_APPS_API_TOKEN not found"

**Solução:** Configure o secret no GitHub (veja seção de pré-requisitos)

### Build falha com erro de memória

**Solução:** O workflow já está configurado com 4GB. Se persistir, aumente `NODE_OPTIONS`

### TypeScript check falha

**Solução:** Corrija os erros de tipo antes de fazer push:

```bash
npx tsc --noEmit
```

### Deploy bem-sucedido mas site não atualiza

**Solução:** 
1. Aguarde 1-2 minutos (propagação de CDN)
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Verifique no Azure se o deploy foi registrado

## 📱 Ambientes

### Production (master branch)
- **Trigger:** Push para `master`
- **URL:** Será exibida no log do workflow

### Preview (Pull Requests)
- **Trigger:** Abrir/atualizar PR
- **URL:** Gerada automaticamente pelo Azure
- **Cleanup:** Deletada quando PR é fechado

## 🎯 Boas práticas

1. ✅ Sempre teste localmente antes de fazer push:
   ```bash
   npm run build
   ```

2. ✅ Verifique erros de TypeScript:
   ```bash
   npx tsc --noEmit
   ```

3. ✅ Use branches para features:
   ```bash
   git checkout -b feature/minha-feature
   ```

4. ✅ Faça commits atômicos e descritivos

5. ✅ Revise o workflow no GitHub Actions após cada push

## 📞 Suporte

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Azure Static Web Apps:** https://docs.microsoft.com/azure/static-web-apps
- **Angular Build:** https://angular.io/guide/deployment

---

**Última atualização:** Novembro 2025
