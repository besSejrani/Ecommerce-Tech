import React, { useState } from "react";

// GraphQL
import { useDeleteProductImageMutation } from "../../Graphql/index";

// Material-UI
import theme from "../../Layout/Theme";
import { Button, Card, Box, MobileStepper, CardActionArea, IconButton } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

// Libraries
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";

// Icons
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import DeleteIcon from "@material-ui/icons/Delete";


// ========================================================================================================

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

type Preview = {
  product: any;
  images?: any;
  router?: string | string[];
};

const PreviewProduct: React.FC<Preview> = ({ product, images, router }) => {
  const classes = useStyles();

  // GraphQL
  const [deleteProductImage] = useDeleteProductImageMutation();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [show, setShow] = useState(false);

  let maxSteps = product.images.length;

  // Events
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  // Delete Product Image
  const deleteImage = async (key) => {
    await deleteProductImage({ variables: { productId: router as string, keyId: key } });
  };

  return (
    <Box className={classes.root}>
      {product.images.length > 0 ? (
        <Card style={{ borderRadius: "10px" }}>
          <AutoPlaySwipeableViews
            interval={3500}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            style={{ width: "100%" }}
          >
            {product?.images.map((product, index) => {
              return (
                <CardActionArea key={index} className={classes.area} disableRipple>
                  <img width={520} height={350} src={`${product}`} title={product.title} alt={product.label} />
                </CardActionArea>
              );
            })}
          </AutoPlaySwipeableViews>
          <MobileStepper
            style={{ background: "none" }}
            steps={maxSteps}
            position="static"
            variant="dots"
            activeStep={activeStep}
            nextButton={
              <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                Next
                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Back
              </Button>
            }
          />
        </Card>
      ) : (
        <></>
      )}

      <Box className={classes.productImagesGroup} onMouseLeave={() => setShow(false)}>
        {images?.map((image, index) => {
          return (
            <Box className={classes.productImagesGroup} onMouseEnter={() => setShow(true)}>
              <img src={image} alt={image} className={classes.productImage}  />
              {show ? (
                  <IconButton className={classes.deleteProductImage} onClick={() => deleteImage(image)}>
                  <DeleteIcon />
                </IconButton>
                  
              ) : (
                <></>
              )}
            </Box>
          );
        })}
      </Box>

    </Box>
  );
};

export default PreviewProduct;

// ========================================================================================================

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexDirection: "column",
      width: "100%",
      padding: "0px 20px 0px 0px",
    },

    media: {
      height: "50%",
    },
    area: {
      display: "flex",
      backgroundColor: "#fafafa",
      height: "100%",
      width: "100%",
    },

    productImagesGroup: {
      display: "flex",
      position: "relative",
      margin: "25px 0px 15px 0px",
    },
    
    productImage: {
      height: 100,
      width: 100,
      margin: "0px 15px 0px 0px",
    },
    deleteProductImage: {
      position: "absolute",
      right: -15,
      top: -15,
      cursor: "pointer",
    },
  })
);
