FROM node:12.20.0-buster
ADD . /node/
WORKDIR /node

RUN cd /node ; npm update ; npm install
RUN adduser appuser
USER appuser

CMD ["node","--max-http-header-size=80000", "/node/index.js"]
#CMD ["/node/test.sh"]
