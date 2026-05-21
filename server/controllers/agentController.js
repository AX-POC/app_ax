const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
// Removed leaked fallback key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const tools = [
  {
    name: 'navigate',
    description: 'Navigate the admin to a specific dashboard page.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: "The URL path to navigate to. Use '/' for Dashboard, '/products' for Products, '/orders' for Orders, '/admins' for Admins." }
      },
      required: ['path']
    }
  },
  {
    name: 'getDashboardSummary',
    description: 'Get high-level summary statistics of the entire e-commerce platform (total revenue, order count, product count, admin count).',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'manageOrders',
    description: 'Perform CRUD operations or SEED fake data for Orders.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: "One of: 'READ', 'UPDATE', 'DELETE', 'SEED'" },
        filters: { type: 'object', description: 'Filters for READ. e.g., { status: "COMPLETED" } or for customer email: { member: { email: { contains: "keyword" } } }' },
        id: { type: 'integer', description: 'ID of the order to update/delete' },
        data: { type: 'object', description: 'Data to update. For status use "PAID", "PREP_SHIPPING", "PICKING", "SHIPPING", "DELIVERED", "CANCELLED", "RETURNED".' }
      },
      required: ['action']
    }
  },
  {
    name: 'manageProducts',
    description: 'Perform CRUD operations or SEED fake data for Products.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: "One of: 'READ', 'CREATE', 'UPDATE', 'DELETE', 'SEED'" },
        filters: { type: 'object', description: 'Filters for READ' },
        id: { type: 'integer', description: 'ID of the product' },
        data: { type: 'object', description: 'Data to create/update. e.g. { productCode: "PRD-001", name: "Shoes", price: 10000, stock: 50 }' }
      },
      required: ['action']
    }
  },
  {
    name: 'manageAdmins',
    description: 'Perform CRUD operations or SEED fake data for Admin users.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: "One of: 'READ', 'CREATE', 'UPDATE', 'DELETE', 'SEED'" },
        filters: { type: 'object', description: 'Filters for READ' },
        id: { type: 'integer', description: 'ID of the admin' },
        data: { type: 'object', description: 'Data to create/update. e.g. { username: "admin2", password: "123", role: "SUB_ADMIN" }' }
      },
      required: ['action']
    }
  }
];

async function executeManageEntity(modelName, args) {
  const { action, filters, id, data } = args;
  const db = prisma[modelName];
  
  try {
    if (action === 'READ') {
      const includeOpts = modelName === 'order' ? { items: true, member: true } : undefined;
      const records = await db.findMany({ where: filters || {}, take: 20, orderBy: { id: 'desc' }, include: includeOpts });
      return { success: true, records };
    } else if (action === 'CREATE') {
      const created = await db.create({ data });
      return { success: true, created, requiresRefresh: true };
    } else if (action === 'UPDATE') {
      if (!id && !filters) throw new Error("ID or filters required for UPDATE");
      if (id) {
        const updated = await db.update({ where: { id }, data });
        return { success: true, updated, requiresRefresh: true };
      } else {
        const updated = await db.updateMany({ where: filters, data });
        return { success: true, updated, requiresRefresh: true };
      }
    } else if (action === 'DELETE') {
      if (!id && !filters) throw new Error("ID or filters required for DELETE");
      if (id) {
        const deleted = await db.delete({ where: { id } });
        return { success: true, deleted, requiresRefresh: true };
      } else {
        const deleted = await db.deleteMany({ where: filters });
        return { success: true, deleted, requiresRefresh: true };
      }
    } else if (action === 'SEED') {
      if (modelName === 'order') await generateDummyOrders();
      if (modelName === 'product') await generateDummyProducts();
      return { success: true, message: 'Seeded dummy data', requiresRefresh: true };
    }
    return { success: false, error: 'Unknown action' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

exports.chat = async (req, res) => {
  try {
    const { message, agent } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const lowerMessage = message.toLowerCase();

    // 0. Intent Routing (Redirect to specialized agent)
    let targetAgent = agent;
    if (lowerMessage.includes('coupon') || lowerMessage.includes('쿠폰') || lowerMessage.includes('discount') || lowerMessage.includes('할인') || lowerMessage.includes('campaign')) {
      targetAgent = 'promotion';
    } else if (lowerMessage.includes('pto') || lowerMessage.includes('pick to order') || lowerMessage.includes('bundle')) {
      targetAgent = 'product';
    } else if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('배송') || lowerMessage.includes('주문') || lowerMessage.includes('picking')) {
      targetAgent = 'order';
    } else if (lowerMessage.includes('deploy') || lowerMessage.includes('storefront') || lowerMessage.includes('스토어') || lowerMessage.includes('사이트')) {
      targetAgent = 'rollout';
    } else if (lowerMessage.includes('security') || lowerMessage.includes('threat') || lowerMessage.includes('scan') || lowerMessage.includes('보안')) {
      targetAgent = 'security';
    }

    if (targetAgent && agent && targetAgent !== agent) {
      const agentName = targetAgent.charAt(0).toUpperCase() + targetAgent.slice(1) + ' Agent';
      return res.json({
        type: 'action',
        text: `It looks like you need help with that. I will redirect you to the ${agentName} who specializes in this area.`,
        action: {
          type: 'CHANGE_AGENT',
          payload: targetAgent,
          originalMessage: message
        }
      });
    }

    // --- Hardcoded Scenarios ---
    
    if (lowerMessage.includes('proactive targeted discount coupon')) {
      return res.json({
        type: 'action',
        text: 'Should we issue a proactive targeted discount coupon to turn these hesitant visitors into buyers?',
        action: { type: 'PROACTIVE_TV_COUPON' }
      });
    }
    if (lowerMessage.includes('pto') || lowerMessage.includes('pick two options')) {
      return res.json({
        type: 'form',
        formType: 'pto_flow',
        text: 'Sure, I can help you set up a PTO (Pick Two Options) bundle. Please configure the details below.'
      });
    }
    if (lowerMessage.includes('coupon') || lowerMessage.includes('쿠폰')) {
      return res.json({
        type: 'form',
        formType: 'promotion',
        text: 'Let\'s create a new promotion. Please specify the target and discount values below.'
      });
    }
    // ---------------------------

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      tools: [{ functionDeclarations: tools }],
      systemInstruction: 'You are an omnipotent AI assistant built into an E-commerce Admin Dashboard. You speak politely in English.\n\nIMPORTANT RULES:\n1. Order statuses are: PAID (결제완료), PREP_SHIPPING (배송준비중), PICKING (피킹중), SHIPPING (배송중), DELIVERED (배송완료), CANCELLED (취소), RETURNED (반품).\n2. If a user asks to cancel an order, check its status using manageOrders. Do not attempt to cancel if status is PICKING, SHIPPING, or DELIVERED. You can only update the status to CANCELLED if it is PAID or PREP_SHIPPING.\n3. You can set the product code (`productCode`) when creating a product.\n4. You have full access to manage Orders, Products, and Admins via the database. If asked to query or change something, use the manage* tools.\n5. After calling a tool, you must summarize the result naturally and concisely for the user.'
    });

    const chat = model.startChat();
    let result = await chat.sendMessage(message);
    let response = result.response;
    
    let functionCalls = response.functionCalls();
    let actionData = null;
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const functionName = call.name;
      const args = call.args;

      let functionResponseData = {};

      if (functionName === 'navigate') {
        actionData = { type: 'NAVIGATE', payload: args.path };
        functionResponseData = { success: true, message: `Navigated to ${args.path}` };
      } else if (functionName === 'getDashboardSummary') {
        const totalRevenueAggr = await prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED' } });
        const summary = {
          totalRevenue: totalRevenueAggr._sum.total || 0,
          totalOrders: await prisma.order.count(),
          totalProducts: await prisma.product.count(),
          totalAdmins: await prisma.adminUser.count()
        };
        functionResponseData = { success: true, summary };
      } else if (functionName === 'manageOrders') {
        functionResponseData = await executeManageEntity('order', args);
        if (functionResponseData.requiresRefresh) actionData = { type: 'REFRESH_DATA' };
      } else if (functionName === 'manageProducts') {
        functionResponseData = await executeManageEntity('product', args);
        if (functionResponseData.requiresRefresh) actionData = { type: 'REFRESH_DATA' };
      } else if (functionName === 'manageAdmins') {
        functionResponseData = await executeManageEntity('adminUser', args);
        if (functionResponseData.requiresRefresh) actionData = { type: 'REFRESH_DATA' };
      }

      // Helper to serialize BigInts
      const serializeBigInt = (obj) => {
        return JSON.parse(JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
      };

      result = await chat.sendMessage([{
        functionResponse: {
          name: functionName,
          response: serializeBigInt(functionResponseData)
        }
      }]);
      response = result.response;
    }

    return res.json({
      type: actionData ? 'action' : 'message',
      text: response.text(),
      action: actionData
    });

  } catch (err) {
    console.error('Agent chat error:', err);
    
    let errorMessage = '서버 오류가 발생했습니다. API 키 또는 서버 로그를 확인해 주세요.';
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      errorMessage = '구글 API 무료 할당량(요청 횟수)을 초과했습니다. 약 1분 정도 기다리신 후 다시 시도해 주세요!';
    } else if (err.status === 404 || (err.message && err.message.includes('404'))) {
      errorMessage = '선택한 AI 모델을 사용할 수 없습니다. API 키의 권한을 확인해 주세요.';
    }

    res.status(500).json({ error: errorMessage });
  }
};

async function generateDummyOrders() {
  const dummyNames = ['김철수', '이영희', '홍길동', '박지민', '최동훈', '정유진', '강다니엘'];
  const addresses = [
    '서울시 강남구 테헤란로 123',
    '부산시 해운대구 마린시티 456',
    '경기도 성남시 분당구 판교역로 789',
    '인천시 연수구 송도과학로 101',
    '제주특별자치도 제주시 첨단로 242'
  ];
  const methods = ['CREDIT_CARD', 'KAKAOPAY', 'NAVERPAY', 'BANK_TRANSFER'];
  
  // Fetch real products from database
  let products = await prisma.product.findMany();
  
  // If no products exist, create some first so orders can link to them
  if (products.length === 0) {
    await generateDummyProducts();
    products = await prisma.product.findMany();
  }
  
  for (let i = 0; i < 5; i++) {
    const name = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomChars}`;
    
    const p1 = products[Math.floor(Math.random() * products.length)];
    const qty1 = Math.floor(Math.random() * 2) + 1;
    
    const items = [
      {
        productId: p1.id,
        productName: p1.name,
        price: p1.price,
        quantity: qty1
      }
    ];
    
    // 50% chance to have a second item
    if (Math.random() > 0.5) {
      const p2 = products[Math.floor(Math.random() * products.length)];
      items.push({
        productId: p2.id,
        productName: p2.name,
        price: p2.price,
        quantity: 1
      });
    }
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await prisma.order.create({
      data: {
        orderNumber,
        customer: name,
        customerEmail: `customer_${Math.floor(Math.random() * 1000)}@example.com`,
        customerPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        shippingAddress: addresses[Math.floor(Math.random() * addresses.length)],
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        total,
        status: 'COMPLETED',
        items: {
          create: items
        }
      }
    });
  }
}

async function generateDummyProducts() {
  const dummyProducts = [
    { name: "프리미엄 런닝화", price: 120000, stock: 50, description: "편안한 착화감을 자랑하는 최고급 런닝화" },
    { name: "베이직 무지 티셔츠", price: 15000, stock: 200, description: "어디에나 잘 어울리는 기본 티셔츠" },
    { name: "스마트 노이즈캔슬링 이어폰", price: 250000, stock: 5, description: "외부 소음을 완벽히 차단하는 스마트 이어폰" },
    { name: "고급 가죽 지갑", price: 85000, stock: 15, description: "천연 소가죽으로 제작된 고급스러운 지갑" },
    { name: "초경량 등산 배낭", price: 150000, stock: 8, description: "전문가를 위한 초경량 아웃도어 배낭" }
  ];
  await prisma.product.createMany({ data: dummyProducts });
}
