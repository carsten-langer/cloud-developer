import bodyParser from 'body-parser';
import express from 'express';
import Jimp from 'jimp';
import { deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  // I implement my own filterImageFromURL function, as the one provided in utils IMHO is buggy.
  // The provided utils/filterImageFromURL does not handle any errors in Jimp.read,
  // thus any error leads to a run-time "UnhandledPromiseRejectionWarning".
  // This behavior is deprecated, leading to a warning of "[DEP0018] DeprecationWarning: Unhandled promise rejections
  // are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a
  // non-zero exit code."
  // The error is not catchable in a try/catch block.
  // Rather than fixing the given utils/filterImageFromURL, I re-implement it via two functions 
  // myFilterImageFromURL and writeImageToFile,
  async function myFilterImageFromURL(inputURL: string): Promise<Jimp> {
    return Jimp.read(inputURL)
      .then((j: Jimp) => j.resize(256, 256))  // resize
      .then((j: Jimp) => j.quality(60)) // set JPEG quality
      .then((j: Jimp) => j.greyscale()) // set greyscale
  }

  async function writeImageToFile(jimp: Jimp): Promise<string> {
    const outpath: string = __dirname + '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg'
    // const outpath: string = '/root/nonaccessiblepath.jpg' // simulate file error
    return new Promise<string>((resolve, reject) =>
      jimp.write(outpath, (err: Error) => {
        if (err) reject(err)
        else resolve(outpath)
      })
    )
  }

  async function deleteLocalFile(path: string): Promise<void> {
    return deleteLocalFiles([path])
      //.then(() => { throw new Error("simulate error during deletion") })
      .then(
        () => console.log("Deleted: " + path),
        (reason) => console.log("Deleting: " + path + " failed with reason: " + reason)
      )
  }

  app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query
    if (!image_url) {
      console.log("Missing image_url parameter.")
      res.status(400).send("Missing image_url parameter, try GET /filteredimage?image_url=...")
    } else {
      myFilterImageFromURL(image_url)
        .then(writeImageToFile)
        .then(
          (path: string) => {
            console.log("Sending image from path: " + path)
            res.status(200).sendFile(path, () => deleteLocalFile(path))
          },
          (reason: any) => {
            const errorMessage: string = "Filtering failed with this reason: " + reason
            console.log(errorMessage)
            res.status(422).send(errorMessage)
          })
    }
  })
  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();