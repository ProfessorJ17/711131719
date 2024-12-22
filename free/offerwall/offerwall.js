const offers = [
  { name: "Complete Survey", reward: "100 Points" },
  { name: "Download App", reward: "200 Points" },
  { name: "Watch Video", reward: "50 Points" },
];

const offersContainer = document.querySelector(".offers");

offers.forEach((offer) => {
  const offerItem = document.createElement("div");
  offerItem.classList.add("offer-item");
  offerItem.innerHTML = `<h3>${offer.name}</h3><p>${offer.reward}</p>`;
  offersContainer.appendChild(offerItem);
});
