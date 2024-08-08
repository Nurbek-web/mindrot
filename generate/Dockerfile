# Use a specific official Fedora image as a parent image
FROM fedora:38

# Enable RPM Fusion Free and Non-Free Repositories
RUN dnf install -y \
    https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-38.noarch.rpm \
    https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-38.noarch.rpm

# Add the Yarn repository and import the GPG key
RUN dnf install -y curl && \
    curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
    rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg

# Install necessary packages including build tools, Python development headers, FFmpeg, and Chromium
RUN dnf install -y python39 yarn gcc gcc-c++ make chromium ffmpeg --allowerasing && \
    dnf clean all

# Install pip for Python 3.9
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python3.9 get-pip.py && \
    rm get-pip.py

# Set the working directory to /app/brainrot
WORKDIR /app/brainrot

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip3.9 install gunicorn && \
    pip3.9 install -r requirements.txt

# Copy package.json and yarn.lock to leverage Docker cache for Yarn dependencies
COPY package.json yarn.lock ./

# Install Node.js dependencies
RUN yarn global add pm2 && yarn install

# Create necessary directories in the public folder
RUN mkdir -p public/voice public/srt

# Copy the rest of the application code
COPY . .

# Copy pm2 ecosystem file
COPY ecosystem.config.js .

# Command to run the application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
