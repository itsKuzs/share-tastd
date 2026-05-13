# share-tastd

Site Next.js qui héberge les pages de partage de collections tastd.

URL prod : `https://share.tastdapp.com/c/<collection-uuid>`

## Setup local

```bash
cd share-tastd
npm install
npm run dev
# → http://localhost:3000/c/c6b3d08a-541f-4189-b761-5a615a7ba462
```

## Deploy Vercel

### 1. Push sur GitHub

Crée un repo `share-tastd` sur GitHub, puis :

```bash
cd share-tastd
git init
git add .
git commit -m "init: share-tastd v1"
git branch -M main
git remote add origin git@github.com:itsKuzs/share-tastd.git
git push -u origin main
```

### 2. Importer dans Vercel

1. https://vercel.com/new
2. Import du repo `share-tastd`
3. Framework : Next.js (auto-détecté)
4. Build command : `npm run build` (default)
5. Deploy

Tu auras une URL `share-tastd-xxx.vercel.app`.

### 3. Connecter le domaine custom

Dans le projet Vercel → Settings → Domains → Add `share.tastdapp.com`.

Vercel te dit quel record DNS ajouter. Va sur Squarespace (DNS de tastdapp.com) et ajoute :

```
Type: CNAME
Host: share
Points to: cname.vercel-dns.com
TTL: default
```

Propagation 5-30 min. Quand le SSL est OK, `https://share.tastdapp.com` répond.

### 4. Vérifier les Universal Links

```bash
curl https://share.tastdapp.com/.well-known/apple-app-site-association
```

Doit retourner le JSON avec ton appID `4F9YQ5NB4J.com.hugovangay.tastd`.

Apple le récupère automatiquement quand on configure les Associated Domains côté Xcode.

## Architecture

```
share.tastdapp.com/                  → landing
share.tastdapp.com/c/<uuid>          → page de collection partagée
share.tastdapp.com/.well-known/...   → Apple App Site Association
```

Les données viennent de l'Edge Function Supabase `get-public-collection`.

## Tester le partage

Une fois deployé, ouvre : 
`https://share.tastdapp.com/c/c6b3d08a-541f-4189-b761-5a615a7ba462`
(c'est ta collection "Fav coffee shops" pour test)
