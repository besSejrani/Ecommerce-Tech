// GraphQL
import { Resolver, Query, Ctx, UseMiddleware } from "type-graphql";
import { MyContext } from "src/Graphql/types/MyContext";

// Database
import { User, UserModel } from "@Model/user/User";
// import { Product, ProductModel } from "@Model/Product";

// Middleware
import { authentication } from "@Middleware/authentication";

// =================================================================================================

@Resolver()
export class GetCartResolver {
  @Query(() => User, { nullable: true })
  @UseMiddleware(authentication)
  async getCart(@Ctx() context: MyContext): Promise<User | null> {
    return await UserModel.findOne({ _id: context.req.userId }).populate({
      path: "cart",
      populate: {
        path: "products",
        model: "products",
      },
    });
  }
}
