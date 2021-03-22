# This Docker file is used to wrap user images in the Lambda Runtime Client and the extendo-hub
# protocol adaptor

# Define custom function directory
ARG FUNCTION_DIR="/entryPoint"
ARG BASE_IMAGE
ARG CMD_LINE

FROM node:12-buster as build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev \
    autoconf \
    libtool

# Copy the locatl entrypoint code into the image to build
COPY entryPoint/* ${FUNCTION_DIR}/

# Install all the npms including the Runtime client
WORKDIR ${FUNCTION_DIR}
RUN npm install aws-lambda-ric

# Grab a fresh slim copy of the image to reduce the final size
FROM ${BASE_IMAGE}

# Include global arg in this stage of the build and persist the user supplied command line in the final image
ARG FUNCTION_DIR
ENV CMD_LINE=${CMD_LINE}

# Set working directory of the image to the entry point's root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built entrypoint code into the final image location
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

# On startup run the the Runtime Interface Client and tell it about our handler 
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["index.handler"]