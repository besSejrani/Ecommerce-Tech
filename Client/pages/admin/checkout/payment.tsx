import React, { useState } from "react";

// Next
import { useRouter } from "next/router";

// React-Hook-Form
import { useForm } from "react-hook-form";

// Material-UI
import { Paper, Box, Typography, Button, Divider } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

// Components
import InputForm from "@Components/Form/InputForm/InputForm";
import DropDownCountries from "@Components/Form/DropDownCountries/DropDown";
import MultiStep from "@Components/Form/MultiStep/MultiStep";

// Hook
import useCalculateCartTotal from "@Hook/useCalculateCartTotal";

// Stripe
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// GraphQl
import { CreateStripePaymentIntentDocument, useGetCartQuery } from "@Graphql/index";

// SSR
import withApollo, { apolloClient } from "@Apollo/ssr";

// Guard
import { withAuth } from "@Guard/withAuth";

// ========================================================================================================

type FormValues = {
  amount: number;
};

const CheckoutPayment = () => {
  const classes = useStyles();

  const router = useRouter();

  // GraphQL
  const { data, loading } = useGetCartQuery();

  // Hook
  const { cartTotal, stripeTotal } = useCalculateCartTotal(data?.getCart?.cart);

  // Stripe
  const stripe = useStripe();
  const elements = useElements();

  // Billing State
  const [billingCountry, setBillingCountry] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [billingCity, setBillingCity] = useState<string>("");
  const [billingZip, setBillingZip] = useState<string>("");

  // Coupon State
  const [coupon, setCoupon] = useState<string>("");

  // Total
  const taxes = parseInt(cartTotal) * 0.077;
  const stripeFees = parseInt(cartTotal) * 0.029;

  // Form
  const { register, errors, handleSubmit } = useForm<FormValues>({
    criteriaMode: "all",
  });

  // Stripe options
  const cardElementOption = {
    hidePostalCode: true,
    style: iframeStyles,
  };

  // Events
  const onSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement("card");

    const billingDetails = {
      name: "Besjan Sejrani",
      email: "besjan.sejrani@cpnv.ch",

      address: {
        country: "ch",
        city: billingCity,
        line1: billingAddress,
        postal_code: billingZip,
      },
    };

    const paymentMethodReq = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: billingDetails,
    });

    const { data: clientSecret } = await apolloClient?.mutate({
      mutation: CreateStripePaymentIntentDocument,
      variables: {
        amount: stripeTotal,
        shippingCountry: "ch",
        shippingAddress: "Avenue Mayor-Vautier 15",
        shippingCity: "Clarens",
        shippingZip: "1815",
      },
    });

    await stripe.confirmCardPayment(clientSecret?.createStripePaymentIntent, {
      payment_method: paymentMethodReq.paymentMethod.id,
    });

    router.push("/products");
  };

  if (loading) return <div>Loading ...</div>;

  return (
    <Paper elevation={3} className={classes.root}>
      <MultiStep first="Shipping" second="Billing" third="Done" />
      <Box className={classes.layout}>
        <Box className={classes.overview}>
          {data?.getCart?.cart.map((item) => (
            <Box key={item._id}>
              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr",
                  gridGap: "1rem",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <img
                    src={item.productImageUrl || "/images/unknownProduct.png"}
                    alt={item.name}
                    width="110"
                    height="110"
                  />
                </Box>

                <Box style={{ display: "flex", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                      {item.name}
                    </Typography>
                    <Box style={{ display: "flex" }}>
                      <Typography variant="body2" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        Quantity:
                      </Typography>
                      <Typography variant="body2" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        1
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body1" style={{ justifySelf: "flex-end" }}>
                  {item.price}.-
                </Typography>
              </Box>
            </Box>
          ))}

          <Divider />

          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              Cart Total
            </Typography>

            <Typography variant="body1" style={{ fontWeight: 500 }}>
              {cartTotal}.-
            </Typography>
          </Box>

          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              Taxes
            </Typography>

            <Typography variant="body1" style={{ fontWeight: 500 }}>
              7.7%
            </Typography>
          </Box>

          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              Stripe Fees
            </Typography>

            <Typography variant="body1" style={{ fontWeight: 500 }}>
              2.9%
            </Typography>
          </Box>

          <Divider />

          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              Total Price
            </Typography>

            <Typography variant="body1" style={{ fontWeight: 500 }}>
              {(parseInt(cartTotal) + taxes + stripeFees).toFixed(2)}.-
            </Typography>
          </Box>
        </Box>
        <Box>
          <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
            <Box className={classes.billing}>
              <Typography variant="h5">Billing</Typography>

              <DropDownCountries
                name="billingCountry"
                id="billingCountry"
                value={billingCountry}
                onChange={setBillingCountry}
              />

              <InputForm
                type="text"
                label="Address"
                name="billingAddress"
                id="billingAddress"
                inputRef={register({
                  required: "This field is required",
                })}
                value={billingAddress}
                onChange={setBillingAddress}
                errors={errors}
              />

              <InputForm
                type="text"
                label="City"
                name="billingCity"
                id="billingCity"
                inputRef={register({
                  required: "This field is required",
                })}
                value={billingCity}
                onChange={setBillingCity}
                errors={errors}
              />

              <InputForm
                type="number"
                label="Zip Code"
                name="billingZip"
                id="billingZip"
                inputRef={register({
                  required: "This field is required",
                })}
                value={billingZip}
                onChange={setBillingZip}
                errors={errors}
              />
            </Box>

            <Box className={classes.cardElements}>
              <CardElement options={cardElementOption} />
            </Box>

            <InputForm
              variant="outlined"
              type="string"
              label="Coupon Code"
              name="coupon"
              id="coupon"
              inputRef={register({})}
              value={coupon}
              onChange={setCoupon}
              errors={errors}
            />
            <Box style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <Button variant="outlined" color="primary" onClick={() => router.back()}>
                Back to Shipping
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: "0px 0px 0px 20px" }}
                onClick={() => router.push("/admin/checkout/done")}
              >
                Confirm Payment
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Paper>
  );
};

export default withApollo({ ssr: true })(withAuth(CheckoutPayment));

// =================================================================

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      borderRadius: 10,
      height: "100%",
      width: "100%",
    },
    layout: {
      display: "flex",
      justifyContent: "space-between",
      padding: "50px 100px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      width: "700px",
    },
    billing: {
      margin: "30px 0px",
      display: "flex",
      flexDirection: "column",
    },
    overview: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gridGap: "1rem",
      width: "40%",
      flexDirection: "row",
    },
    cardElements: {
      border: "1px solid rgba(33, 33, 33, 0.5)",
      margin: "0px 0px 20px 0px",
      padding: "20px 20px 20px 20px",
      borderRadius: 6,
    },
  }),
);

// Stripe Card Element Style
const iframeStyles = {
  base: {
    fontSize: "16px",
  },
  invalid: {},
  complete: {},
};
