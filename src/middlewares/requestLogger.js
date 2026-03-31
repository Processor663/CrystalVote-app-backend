import morgan from "morgan";
import stream  from "../utils/stream.js";

const requestLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream },
);
export default requestLogger;