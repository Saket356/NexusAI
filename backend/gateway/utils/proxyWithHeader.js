import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
         limit: "25mb",
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = String(srcReq.user.userID)
            }
            return proxyReqOpts
        }
    })
}