import React, { useState } from "react";

// Next
import { useRouter } from "next/router";

// React-Hook-Form
import { useForm } from "react-hook-form";

// Material-UI
import { Button, Box, Card, Typography, IconButton } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

// Icons
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

// Components
import InputForm from "@Components/InputForm/InputForm";

// Apollo
import { useUpdateCategoryMutation, useGetCategoryQuery } from "@Graphql/index";

// SSR
import withApollo from "@Apollo/ssr";

// ========================================================================================================

type FormValues = {
  categoryName: string;
};

const CreateProductAdmin = () => {
  const classes = useStyles();
  const router = useRouter();
  const { query } = router;

  // GraphQL
  const { data } = useGetCategoryQuery({ variables: { categoryId: query.id as string } });

  const [categoryName, setCategoryName] = useState(data?.getCategory.name);

  const { register, errors, handleSubmit } = useForm<FormValues>({
    criteriaMode: "all",
  });

  const [updateCategory] = useUpdateCategoryMutation();

  const onSubmit = async (form) => {
    await updateCategory({
      variables: {
        categoryId: query.id as string,
        name: form.categoryName,
      },
    });

    await router.push("/admin/categories");
  };

  return (
    <Box className={classes.root}>
      <Card elevation={1} className={classes.card}>
        <Box className={classes.content}>
          <Box className={classes.backButton} onClick={() => router.back()}>
            <IconButton edge="start">
              <ArrowBackIcon color="primary" />
            </IconButton>
            <Typography variant="body1">Go Back</Typography>
          </Box>
          <Box>
            <Typography variant="h4" style={{ fontSize: "1.85rem" }}>
              Update Category
            </Typography>
          </Box>

          <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
            <InputForm
              type="text"
              name="categoryName"
              id="categoryName"
              label="Name"
              inputRef={register({
                required: "This field is required",
              })}
              value={categoryName}
              onChange={setCategoryName}
              errors={errors}
            />

            <Box style={{ flexDirection: "row", marginTop: "25px" }}>
              <Button variant="contained" color="secondary" type="submit">
                Update Category
              </Button>
            </Box>
          </form>
        </Box>
      </Card>
    </Box>
  );
};
export default withApollo({ ssr: true })(CreateProductAdmin);

// ========================================================================================================

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    card: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "400px",
      height: 300,
      borderRadius: "10px",
    },

    content: {
      flexDirection: "column",
      padding: "30px",
      width: "100%",
    },

    backButton: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      width: "150px",
      padding: "0px 0px 15px 0px",
    },

    form: {
      display: "flex",
      flexDirection: "column",
      margin: "45px 0px 0px 0px",
    },
  })
);