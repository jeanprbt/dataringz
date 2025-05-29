import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event);

    if (!url.pathname.startsWith("/storage/")) {
        return;
    }

    try {
        // remove the /storage/ prefix to get the relative path
        const relativePath = url.pathname.slice("/storage/".length);

        // path to the storage directory outside the built app
        const storagePath = join(process.cwd(), "storage", relativePath);

        // check if file exists
        const stats = await stat(storagePath);
        if (!stats.isFile()) {
            return createError({
                statusCode: 404,
                statusMessage: "Not Found",
            });
        }

        // Set appropriate content type based on file extension
        const ext = storagePath.split(".").pop()?.toLowerCase();
        if (ext === "jpg" || ext === "jpeg") {
            setResponseHeader(event, "Content-Type", "image/jpeg");
        } else if (ext === "png") {
            setResponseHeader(event, "Content-Type", "image/png");
        } else if (ext === "gif") {
            setResponseHeader(event, "Content-Type", "image/gif");
        } else if (ext === "webp") {
            setResponseHeader(event, "Content-Type", "image/webp");
        } else if (ext === "svg") {
            setResponseHeader(event, "Content-Type", "image/svg+xml");
        } else if (ext === "mp4") {
            setResponseHeader(event, "Content-Type", "video/mp4");
        }

        // stream the file as response
        return sendStream(event, createReadStream(storagePath));
    } catch (error) {
        console.error("Error serving static file:", error);
        return createError({
            statusCode: 404,
            statusMessage: "Not Found",
        });
    }
});
