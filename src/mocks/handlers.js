import { http, HttpResponse } from 'msw'

const db = {
  users: [
    { username: 'admin', role: 'ADMIN', balance: 0 },
    { username: 'teststore', role: 'STORE', balance: 0 },
    { username: 'testuser', role: 'MEMBER', balance: 1000 },
  ],
  products: [
    { id: 1, name: '大杯美式', required_points: 50, stock: 10, is_active: true, store: '台譜咖啡' },
    { id: 2, name: '起司蛋糕', required_points: 120, stock: 5, is_active: true, store: '台譜咖啡' },
  ],
  transactions: [],
  exchanges: []
}

const getCurrentUser = (request) => {
  const auth = request.headers.get('Authorization')
  if (!auth) return null
  const username = auth.replace('Bearer mock-token-', '')
  return db.users.find(u => u.username === username)
}

export const handlers = [
  http.post('*/api/auth/token/', async ({ request }) => {
    const { username } = await request.json()
    const user = db.users.find(u => u.username === username)
    
    if (!user) {
      return new HttpResponse(null, { status: 401 })
    }
    return HttpResponse.json({
      access: `mock-token-${username}`,
      refresh: 'mock-refresh-token',
      user: { username: user.username, role: user.role }
    })
  }),
  
  http.get('*/api/users/me/', ({ request }) => {
    const user = getCurrentUser(request)
    if (!user) return new HttpResponse(null, { status: 401 })
    return HttpResponse.json(user)
  }),

  http.get('*/api/products/', () => {
    return HttpResponse.json(db.products.filter(p => p.is_active))
  }),

  http.post('*/api/products/', async ({ request }) => {
    const payload = await request.json()
    const newProduct = { id: db.products.length + 1, is_active: true, ...payload }
    db.products.push(newProduct)
    return HttpResponse.json(newProduct, { status: 201 })
  }),

  http.patch('*/api/products/:id/', async ({ params, request }) => {
    const { id } = params
    const payload = await request.json()
    const idx = db.products.findIndex(p => p.id === Number(id))
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    db.products[idx] = { ...db.products[idx], ...payload }
    return HttpResponse.json(db.products[idx])
  }),

  http.delete('*/api/products/:id/', ({ params }) => {
    const idx = db.products.findIndex(p => p.id === Number(params.id))
    if (idx !== -1) db.products[idx].is_active = false
    return new HttpResponse(null, { status: 204 })
  }),
  
  http.get('*/api/points/transactions/', ({ request }) => {
    const user = getCurrentUser(request)
    if (!user) return new HttpResponse(null, { status: 401 })
    const data = user.role === 'ADMIN' 
      ? db.transactions 
      : db.transactions.filter(t => t.user_username === user.username)
    return HttpResponse.json(data)
  }),

  http.get('*/api/points/exchanges/', ({ request }) => {
    const user = getCurrentUser(request)
    if (!user) return new HttpResponse(null, { status: 401 })
    if (user.role === 'ADMIN' || user.role === 'STORE') {
      return HttpResponse.json(db.exchanges)
    }
    const data = db.exchanges.filter(e => e.user_username === user.username)
    return HttpResponse.json(data)
  }),
  
  http.get('*/api/points/exchanges/lookup-by-code/', ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const exchange = db.exchanges.find(e => e.exchange_code === code)
    if (!exchange) return HttpResponse.json({ detail: '找不到此序號' }, { status: 404 })
    return HttpResponse.json(exchange)
  }),

  http.patch('*/api/points/exchanges/:id/', async ({ params, request }) => {
    const { status } = await request.json()
    const exchange = db.exchanges.find(e => e.id === Number(params.id))
    if (!exchange) return new HttpResponse(null, { status: 404 })
    exchange.status = status
    return HttpResponse.json(exchange)
  }),

  http.post('*/api/points/exchange/', async ({ request }) => {
    const user = getCurrentUser(request)
    const { product_id, quantity } = await request.json()
    const product = db.products.find(p => p.id === product_id)
    const cost = product.required_points * quantity
    if (product && product.stock >= quantity && user.balance >= cost) {
      product.stock -= quantity
      user.balance -= cost
      
      const newExchange = {
        id: db.exchanges.length + 1,
        exchange_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        user_username: user.username,
        product: { id: product.id, name: product.name },
        quantity,
        points_spent: cost,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
      db.exchanges.push(newExchange)
      db.transactions.push({
        id: db.transactions.length + 1,
        user_username: user.username,
        amount: -cost,
        tx_type: 'EXCHANGE',
        is_success: true,
        created_at: new Date().toISOString()
      })
      
      return HttpResponse.json({ detail: '兌換成功' }, { status: 201 })
    }
    return HttpResponse.json({ detail: '庫存或點數不足' }, { status: 400 })
  }),

  http.post('*/api/points/deposit/', async ({ request }) => {
    const user = getCurrentUser(request)
    const { amount } = await request.json()
    user.balance += amount
    db.transactions.push({
      id: db.transactions.length + 1,
      user_username: user.username,
      amount: amount,
      tx_type: 'DEPOSIT',
      is_success: true,
      created_at: new Date().toISOString()
    })
    return HttpResponse.json({ detail: '儲值成功' })
  })
]