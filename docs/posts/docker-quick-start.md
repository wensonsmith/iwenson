---
title: Docker 基础使用指南
permalink: docker-quick-start
date: 2017-03-31 22:34
category: 折腾
tags: [Docker]
---

1. 安装教程（Ubuntu 16.01）

   https://store.docker.com/editions/community/docker-ce-server-ubuntu

2. 执行一个镜像（Hello World）

   ```bash
   docker run hello-world
   ```

   

3. 运行线上的一个镜像

   ```
   docker run docker/whalesay cowsay boo-boo
   ```

   `cowsay boo-boo   `  是一个命令

4. 创建自己的镜像

   Docker 通过 Dockfile 来定义镜像内容，所以第一步先创建一个 Dockfile

   ```
   touch Dockfile
   FROM docker/whalesay:latest  // FROM 用来表示该镜像是基于什么镜像
   RUN apt-get -y update && apt-get install -y fortunes  //执行一条命令
   CMD /usr/games/fortune -a | cowsay  // CMD 表示执行最后的命令
   ```

   在使用Dockerfile创建image时, 有几条指令比较容易混淆, RUN, CMD, ENTRYPOINT.

   RUN是在building image时会运行的指令, 在Dockerfile中可以写多条RUN指令.

   CMD和ENTRYPOINT则是在运行container 时会运行的指令, 都只能写一条, 如果写了多条, 则最后一条生效。

   参考文档： 

   http://blog.163.com/digoal@126/blog/static/163877040201410411715832/

   http://cloud.51cto.com/art/201411/457338.htm

5. build 自己的镜像

   ```
   docker build -t my-docker // -t 参数打 tag
   // 运行自己的镜像
   docker run my-docker
   ```

6. 上传自己的镜像

   首先要去 store.docker.com 里面注册病创建自己的 repository

   ```
   // 列出自己的镜像，查看 镜像 IMAGE ID
   docker images
   // 给镜像打 repository 标签
   docker tag IMAGEID accountname/imagename:version
   // 登录
   docker login
   // 推送
   docker push accountname/imagename
   ```

7. Docker run 命令常用参数

   最基本的docker run命令是如下格式：

   ```
   $ sudo docker run [OPTIONS] IMAGE[:TAG] [COMMAND] [ARG...]
   ```

   ```
   -d //后台执行
   --name //指定 container 的名称
   // volumn 挂载磁盘
   -v, --volume=[host-src:]container-dest[:<options>]: Bind mount a volume.
   参数有 rw(read && write) | ro (read only)
   -p 暴露端口
   docker container ls -a // 查看所有 container
   docker container ps //查看运行中的 container
   docker container rm $(docker ps -a -q) //删除所有 docker
   ```

   参考资料：http://www.tuicool.com/articles/uUBVJr

8. 解决 Ubuntu docker 需要 sudo 

   1.创建docker组：sudo groupadd docker

   2.将当前用户加入docker组：sudo gpasswd -a ${USER} docker

   3.重启服务：sudo service docker restart

   4. 刷新Docker成员：newgrp - docker**

9. 运行一个 Nginx

   ```
   docker run --name nginx-container -v /var/www/public:/usr/share/nginx/html:ro -d -p 80:80 nginx
   ```

10. 安装 docker-composer

    ```shell
    $ curl -L "https://github.com/docker/compose/releases/download/1.11.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    $ chmod +x /usr/local/bin/docker-compose

    // 或者使用 pip
    $ pip install docker-compose
    ```

11. 配置 docker-composer.yml

    ```yaml
    version: '3.0'
    services:
      nginx-box:
        image: nginx:latest
        volumes:
        - /var/www/public:/usr/share/nginx/html:ro
        - /var/www/nginx/conf/site.conf/default.conf:/etc/nginx/conf.d/site.conf:ro
        ports: 
        - "80:80"
        links: 
        - php-box
      php-box:
        image: php:7.1-fpm
        volumes: 
        - /var/www/public:/usr/share/nginx/html:ro
        expose:
        - "9000"
    ```

    ```nginx
    server {
    	listen       80;
    	server_name  dockertest.com;
    	root /usr/share/nginx/html;

    	location / {
    		index  index.html index.htm index.php;
    	}

    	error_page   500 502 503 504  /50x.html;
    	location = /50x.html {
    		root   html;
    	}

    	location ~ \.php$ {
    		fastcgi_pass   php-box:9000;
    		fastcgi_index  index.php;
    		fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    		include        fastcgi_params;
    	}

    }
    ```

    