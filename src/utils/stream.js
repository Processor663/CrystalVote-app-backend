import logger from "../lib/logger.js";

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default stream;
