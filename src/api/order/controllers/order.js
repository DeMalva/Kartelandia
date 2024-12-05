"use strict";
/* eslint-disable */

const stripe = require("stripe")(
  "sk_test_51QGPzvAw37SqtL37mbXj07fqUSsmb3Le0TBFdg5kQomT3etW3E0uSfnDpKycpKRwnY1SdLuR11Q3CBlYIezJBYxH00vWd8TeUa"
);

function calcDiscountPrice(price, discount) {
  if (!discount) return price;

  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;

  return result.toFixed(2);
}

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async paymentOrder(ctx) {
    const { token, products, idUser, addressShipping } = ctx.request.body;

    let total = 0;
    products.forEach((product) => {
      const priceTemp = calcDiscountPrice(product.price, product.discount);

      total += Number(priceTemp) * product.quantity;
    });

    const charge = await stripe.charges.create({
      amount: Math.round(total * 100),
      currency: "eur",
      source: token.id,
      description: `User ID: ${idUser}`,
    });

    const data = {
      products,
      user: idUser,
      total,
      idPay: charge.id,
      addressShipping,
    };

    const model = strapi.contentTypes["api::order.order"];
    const validData = await strapi.entityValidator.validateEntityCreation(
      model,
      data
    );

    const entry = await strapi.db
      .query("api::order.order")
      .create({ data: validData });

    return entry;
  },
}));
