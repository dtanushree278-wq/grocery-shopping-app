const products = [
  {id:1,name:"Fresh Apples",category:"Fruits",price:120,unit:"1 kg",emoji:"🍎",tag:"Popular"},
  {id:2,name:"Bananas",category:"Fruits",price:50,unit:"1 dozen",emoji:"🍌",tag:"Fresh"},
  {id:3,name:"Sweet Oranges",category:"Fruits",price:80,unit:"1 kg",emoji:"🍊"},
  {id:4,name:"Green Grapes",category:"Fruits",price:95,unit:"500 g",emoji:"🍇"},
  {id:5,name:"Fresh Tomatoes",category:"Vegetables",price:35,unit:"500 g",emoji:"🍅",tag:"Daily pick"},
  {id:6,name:"Potatoes",category:"Vegetables",price:30,unit:"1 kg",emoji:"🥔"},
  {id:7,name:"Broccoli",category:"Vegetables",price:65,unit:"1 piece",emoji:"🥦"},
  {id:8,name:"Carrots",category:"Vegetables",price:45,unit:"500 g",emoji:"🥕"},
  {id:9,name:"Full Cream Milk",category:"Dairy",price:32,unit:"500 ml",emoji:"🥛"},
  {id:10,name:"Cheese",category:"Dairy",price:110,unit:"200 g",emoji:"🧀"},
  {id:11,name:"Butter",category:"Dairy",price:58,unit:"100 g",emoji:"🧈"},
  {id:12,name:"Brown Bread",category:"Bakery",price:45,unit:"1 pack",emoji:"🍞"},
  {id:13,name:"Eggs",category:"Essentials",price:72,unit:"6 pieces",emoji:"🥚"},
  {id:14,name:"Rice",category:"Essentials",price:68,unit:"1 kg",emoji:"🍚"},
  {id:15,name:"Cooking Oil",category:"Essentials",price:145,unit:"1 litre",emoji:"🫒"},
  {id:16,name:"Orange Juice",category:"Beverages",price:90,unit:"1 litre",emoji:"🧃"}
];
const categories = ["All","Fruits","Vegetables","Dairy","Bakery","Essentials","Beverages"];
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("freshcart-cart") || "{}");
const $ = id => document.getElementById(id);
const money = n => "₹" + n.toFixed(2).replace(/\.00$/,"");

function saveCart(){localStorage.setItem("freshcart-cart",JSON.stringify(cart));}
function renderCategories(){
  $("categoryFilters").innerHTML = categories.map(c=>`<button class="category-btn ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
}
function renderProducts(){
  const term = $("searchInput").value.trim().toLowerCase();
  const filtered = products.filter(p=>(activeCategory==="All"||p.category===activeCategory) && (p.name.toLowerCase().includes(term)||p.category.toLowerCase().includes(term)));
  $("resultCount").textContent = `${filtered.length} products`;
  $("productGrid").innerHTML = filtered.length ? filtered.map(p=>`
    <article class="product-card">
      <div class="product-image">${p.tag?`<span class="product-tag">${p.tag}</span>`:""}${p.emoji}</div>
      <h3>${p.name}</h3><div class="product-meta">${p.category} · ${p.unit}</div>
      <div class="product-bottom"><span class="price">${money(p.price)} <small>/ ${p.unit}</small></span><button class="add-btn" data-add="${p.id}">+ Add</button></div>
    </article>`).join("") : `<div class="empty">No products found. Try another search.</div>`;
}
function cartEntries(){return Object.entries(cart).map(([id,qty])=>({product:products.find(p=>p.id===Number(id)),qty})).filter(x=>x.product&&x.qty>0);}
function totals(){
  const subtotal=cartEntries().reduce((s,x)=>s+x.product.price*x.qty,0);
  const delivery=subtotal===0||subtotal>=499?0:30;
  return {subtotal,delivery,total:subtotal+delivery};
}
function renderCart(){
  const entries=cartEntries(), count=entries.reduce((s,x)=>s+x.qty,0), t=totals();
  $("cartCount").textContent=count;
  $("cartItems").innerHTML=entries.length?entries.map(({product:p,qty})=>`
    <div class="cart-row"><div class="cart-emoji">${p.emoji}</div><div><h4>${p.name}</h4><small>${money(p.price)} / ${p.unit}</small><div class="quantity"><button data-qty="${p.id}" data-change="-1" aria-label="Decrease">−</button><b>${qty}</b><button data-qty="${p.id}" data-change="1" aria-label="Increase">+</button></div></div><div><b>${money(p.price*qty)}</b><br><button class="remove-btn" data-remove="${p.id}">Remove</button></div></div>`).join(""):`<div class="empty">Your cart is empty 🛒<br>Add some fresh groceries to get started.</div>`;
  $("subtotal").textContent=money(t.subtotal);$("delivery").textContent=t.delivery?money(t.delivery):"FREE";$("total").textContent=money(t.total);$("checkoutTotal").textContent=money(t.total);
}
function updateCart(id,change){cart[id]=(cart[id]||0)+change;if(cart[id]<=0)delete cart[id];saveCart();renderCart();}
function openCart(){$("cartDrawer").classList.add("open");$("overlay").classList.add("show");}
function closeCart(){$("cartDrawer").classList.remove("open");$("overlay").classList.remove("show");}
let toastTimer;
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2200);}

$("categoryFilters").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;activeCategory=btn.dataset.category;renderCategories();renderProducts();});
$("productGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(!btn)return;const id=Number(btn.dataset.add);cart[id]=(cart[id]||0)+1;saveCart();renderCart();toast("Added to your cart!");});
$("cartItems").addEventListener("click",e=>{const qty=e.target.closest("[data-qty]");const remove=e.target.closest("[data-remove]");if(qty)updateCart(qty.dataset.qty,Number(qty.dataset.change));if(remove){delete cart[remove.dataset.remove];saveCart();renderCart();}});
$("searchInput").addEventListener("input",renderProducts);
$("cartToggle").addEventListener("click",openCart);$("closeCart").addEventListener("click",closeCart);$("overlay").addEventListener("click",closeCart);
$("checkoutBtn").addEventListener("click",()=>{if(!cartEntries().length){toast("Your cart is empty.");return;}closeCart();$("checkoutModal").classList.add("show");});
$("closeCheckout").addEventListener("click",()=>$("checkoutModal").classList.remove("show"));
$("checkoutModal").addEventListener("click",e=>{if(e.target===$("checkoutModal"))$("checkoutModal").classList.remove("show");});
$("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();if(!cartEntries().length)return;
  const data=Object.fromEntries(new FormData(e.target).entries()), t=totals();
  const order={orderId:"FC"+Date.now().toString().slice(-7),date:new Date().toLocaleString(),customer:data,items:cartEntries(),...t};
  const orders=JSON.parse(localStorage.getItem("freshcart-orders")||"[]");orders.unshift(order);localStorage.setItem("freshcart-orders",JSON.stringify(orders));
  cart={};saveCart();renderCart();renderProducts();e.target.reset();$("checkoutModal").classList.remove("show");
  alert(`Thank you, ${data.name}! Your demo order ${order.orderId} has been placed.\nOrder total: ${money(t.total)}\n\nThis is a student demo. No real payment or delivery is processed.`);
});
renderCategories();renderProducts();renderCart();
