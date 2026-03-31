import logger from "../config/logger.js";

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default stream;
