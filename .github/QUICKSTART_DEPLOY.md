# 🚀 Guia Rápido de Deploy

## ⚡ Deploy em 3 passos

### 1️⃣ Validar localmente

```bash
npm run pre-deploy
```

Este comando vai:
- ✅ Verificar erros de TypeScript
- ✅ Fazer build de produção
- ✅ Validar arquivos gerados

### 2️⃣ Commitar mudanças

```bash
git add .
git commit -m "feat: Adicionar criptografia nas mensagens"
git push origin master
```

### 3️⃣ Acompanhar deploy

Acesse: https://github.com/SEU_USUARIO/SEU_REPO/actions

O deploy acontece automaticamente! 🎉

---

## 📋 Checklist pré-deploy

- [ ] Código funciona localmente (`npm start`)
- [ ] Sem erros de TypeScript (`npm run typecheck`)
- [ ] Build de produção funciona (`npm run build:prod`)
- [ ] Mudanças commitadas
- [ ] Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` configurado no GitHub

---

## 🔧 Comandos úteis

```bash
# Verificar apenas TypeScript
npm run typecheck

# Build de produção
npm run build:prod

# Validação completa
npm run pre-deploy
```

---

## 🆘 Problemas comuns

### "Secret not found"
Configure o token do Azure no GitHub:
Settings → Secrets → Actions → New secret

### "Build failed"
Verifique o log no GitHub Actions para ver o erro específico

### "TypeScript errors"
Execute `npm run typecheck` localmente para ver os erros

---

**Precisa de ajuda?** Veja o [DEPLOY.md](../DEPLOY.md) completo.
