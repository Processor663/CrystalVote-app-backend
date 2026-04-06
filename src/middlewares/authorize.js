// const { StatusCodes } = require("http-status-codes");
// const AppError = require("../utils/AppError");
// require("dotenv").config();

// exports.protect = async (req, res, next) => {

// };


// exports.authorize =
//   (roles = []) =>
//   (req, res, next) => {
  
//     if (!req.user) {
//       return next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED));    
//     }

//     // Check if the user's role is allowed
//     if (
//       !roles.map((r) => r.toLowerCase()).includes(req.user.role?.toLowerCase())
//     ) {
//       return next(new AppError("Forbidden", StatusCodes.FORBIDDEN));
//     }

//     next();
//   };
