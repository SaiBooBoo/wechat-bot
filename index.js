// index.js
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// products: one product (WeChat account) with 3 duration options and prices
const PRODUCT = {
  id: 'wechat_acc',
  name: 'WeChat Account',
  options: [
    { id: 'd1', title: '1 month', price: 40000 },
    { id: 'd3', title: '3 months', price: 80000 },
    { id: 'd6', title: '6 months', price: 120000 },
  ]
};

// carts stored per user: saved to carts.json for simple persistence
const CART_FILE = path.join(__dirname, 'carts.json');
let carts = {};

// load carts from file if exists
try {
  if (fs.existsSync(CART_FILE)) {
    carts = JSON.parse(fs.readFileSync(CART_FILE, 'utf8') || '{}');
  }
} catch (err) {
  console.error('Failed to load carts.json:', err);
  carts = {};
}

function saveCarts() {
  fs.writeFileSync(CART_FILE, JSON.stringify(carts, null, 2));
}

// helper: get user's cart object (create if missing)
function getCart(userId) {
  if (!carts[userId]) carts[userId] = { items: [] }; // items: [{ optionId, qty }]
  return carts[userId];
}

// /start - welcome + business model + buttons
bot.start((ctx) => {
  const name = ctx.from.first_name || 'friend';
  const welcome = `👋 Hi ${name}!\n\n` +
    `Welcome to our WeChat Account Shop.\n` +
    `We sell ready-to-use WeChat accounts with different durations.\n\n` +
    `How we work: you choose a plan, add to cart, pay, and we deliver the account privately.\n` +
    `Reliable, fast, and secure.`;

  return ctx.reply(welcome, Markup.inlineKeyboard([
    [Markup.button.callback('🛒 Shop', 'OPEN_SHOP')],
    [Markup.button.callback('❓ Help', 'OPEN_HELP'), Markup.button.url('💬 Contact', 'https://t.me/YourSupportUsername')]
  ]));
});

// /shop - show the product options with add-to-cart buttons
bot.command('shop', (ctx) => {
  return sendShop(ctx);
});

bot.action('OPEN_SHOP', (ctx) => {
  ctx.answerCbQuery();
  return sendShop(ctx);
});

function sendShop(ctx) {
  // show single product with options
  let text = `🛍️ ${PRODUCT.name}\nChoose a duration:\n\n`;
  PRODUCT.options.forEach(o => {
    text += `${o.title} — ${o.price.toLocaleString()} \n`;
  });
  const buttons = PRODUCT.options.map(o => Markup.button.callback(`Add ${o.title} (${o.price.toLocaleString()})`, `ADD_${o.id}`));
  const kb = Markup.inlineKeyboard([
    [buttons[0]],
    [buttons[1]],
    [buttons[2]],
    [Markup.button.callback('View Cart', 'VIEW_CART')]
  ]);
  return ctx.reply(text, kb);
}

// handle add-to-cart actions
bot.action(/ADD_(.+)/, (ctx) => {
  const uid = String(ctx.from.id);
  const optionId = ctx.match[1]; // captured from regex
  const opt = PRODUCT.options.find(o => o.id === optionId);
  if (!opt) {
    ctx.answerCbQuery('Option not found');
    return;
  }
  const cart = getCart(uid);
  const existing = cart.items.find(i => i.optionId === optionId);
  if (existing) existing.qty += 1;
  else cart.items.push({ optionId: optionId, qty: 1 });
  saveCarts();
  ctx.answerCbQuery(`Added ${opt.title} to your cart ✅`);
});

// /cart - show user's cart
bot.command('cart', (ctx) => {
  return showCart(ctx);
});
bot.action('VIEW_CART', (ctx) => {
  ctx.answerCbQuery();
  return showCart(ctx);
});

function showCart(ctx) {
  const uid = String(ctx.from.id);
  const cart = getCart(uid);
  if (!cart.items.length) {
    return ctx.reply('🧺 Your cart is empty. Use /shop to add an option.');
  }
  let text = '🧾 Your Cart:\n\n';
  let total = 0;
  cart.items.forEach((it, idx) => {
    const opt = PRODUCT.options.find(o => o.id === it.optionId);
    const lineTotal = opt.price * it.qty;
    total += lineTotal;
    text += `${idx+1}. ${PRODUCT.name} — ${opt.title} x${it.qty} = ${lineTotal.toLocaleString()}\n`;
  });
  text += `\nTotal: ${total.toLocaleString()}\n\n`;
  const kb = Markup.inlineKeyboard([
    [Markup.button.callback('Checkout (placeholder)', 'CHECKOUT')],
    [Markup.button.callback('Clear Cart', 'CLEAR_CART')]
  ]);
  return ctx.reply(text, kb);
}

// clear cart
bot.action('CLEAR_CART', (ctx) => {
  const uid = String(ctx.from.id);
  carts[uid] = { items: [] };
  saveCarts();
  ctx.answerCbQuery('Cart cleared');
  return ctx.reply('Your cart is now empty.');
});

// checkout stub
bot.action('CHECKOUT', (ctx) => {
  const uid = String(ctx.from.id);
  const cart = getCart(uid);
  if (!cart.items.length) return ctx.answerCbQuery('Cart is empty');
  ctx.answerCbQuery();
  // For now, just simulate order placement
  const orderId = 'ORD' + Date.now();
  // In production: you would call payment API here and confirm payment before delivery
  carts[uid] = { items: [] }; // clear cart after placing
  saveCarts();
  ctx.reply(`✅ Order ${orderId} placed. We will send account details privately shortly.\nIf you need help, type /help or contact support.`);
});

// /help - explain process
bot.command('help', (ctx) => {
  const helpText =
    `❓ How it works:\n` +
    `1) Use /shop to pick an option (1/3/6 months).\n` +
    `2) Add to cart. View cart with /cart.\n` +
    `3) Press Checkout and follow payment instructions (will be added soon).\n` +
    `4) After payment we deliver account privately.\n\n` +
    `Need support? Contact: @Shiny_thePro`;
  return ctx.reply(helpText);
});

// fallback for unknown callbacks
bot.on('callback_query', (ctx) => {
  // handled above — keep this to avoid "No handler" errors
  ctx.answerCbQuery().catch(() => {});
});

// start bot
bot.launch().then(() => console.log('Bot running'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
