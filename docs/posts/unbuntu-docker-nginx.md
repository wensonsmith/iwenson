---
title: Ubuntu docker 安装 nginx
date: 2017-06-05 16:57
category: 折腾
tags: ['docker', 'nginx']
---

1. 添加用户

```shell
adduser username
```

2. 修改 sudoers

   ```shell
   # chmod a+w /etc/sudoers
   # username (ALL:ALL) ALL
   # chmod a-w /etc/sudoers
   ```

3. 禁止 root 登录

   ```shell
   vim /etc/ssh/sshd_config
   # PermitRootLogin yes
   PermitRootLogin no
   ```

4. Ubuntu 安装 Docker-CE

   ```shell
   lsb_release -cs   //查看发版编号
   sudo apt-get -y install apt-transport-https ca-certificates curl

   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
     
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

   # 如果提示为找到 add-apt-repository command 
   # sudo apt-get install software-properties-common

   sudo apt-get update
   sudo apt-get -y install docker-ce

   ```

5. 安装 Docker-composer

   ```shell
   curl -L https://github.com/docker/compose/releases/download/1.13.0/docker-compose-`uname -s`-`uname -m` > ./docker-compose

   sudo mv ./docker-compose /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   ```

6. 配置 nginx ,大致有这么几个配置文件


```shell
#------------------------------------
#/path/to/nginx/nginx.conf
#user   root;
worker_processes  4;

events {
        worker_connections  1024;
}

http {
        include       mime.types;
        default_type  application/octet-stream;

        server_names_hash_bucket_size 128;
        client_header_buffer_size 32k;
        large_client_header_buffers 4 32k;
        client_max_body_size 50m;

        sendfile   on;
        tcp_nopush on;

        keepalive_timeout 60;

        tcp_nodelay on;

        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 64k;
        fastcgi_buffers 4 64k;
        fastcgi_busy_buffers_size 128k;
        fastcgi_temp_file_write_size 256k;

        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;
        error_log               /var/log/nginx/error.log;

        gzip  on;
        gzip_min_length 1k;
        gzip_buffers    4 16k;
        gzip_http_version 1.0;
        gzip_comp_level 6;
        gzip_types text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml;
        gzip_vary on;

        include servers/*.conf;
}

#------------------------------------
#/path/to/nginx/conf.d/php-fpm.conf
location ~ \.php$ {
        try_files      $uri = 404;
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_intercept_errors        on;

        fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
        fastcgi_param  QUERY_STRING       $query_string;
        fastcgi_param  REQUEST_METHOD     $request_method;
        fastcgi_param  CONTENT_TYPE       $content_type;
        fastcgi_param  CONTENT_LENGTH     $content_length;

        fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
        fastcgi_param  REQUEST_URI        $request_uri;
        fastcgi_param  DOCUMENT_URI       $document_uri;
        fastcgi_param  DOCUMENT_ROOT      $document_root;
        fastcgi_param  SERVER_PROTOCOL    $server_protocol;
        fastcgi_param  HTTPS              $https if_not_empty;

        fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
        fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;

        fastcgi_param  REMOTE_ADDR        $remote_addr;
        fastcgi_param  REMOTE_PORT        $remote_port;
        fastcgi_param  SERVER_ADDR        $server_addr;
        fastcgi_param  SERVER_PORT        $server_port;
        fastcgi_param  SERVER_NAME        $server_name;

        # PHP only, required if PHP was built with --enable-force-cgi-redirect
        fastcgi_param  REDIRECT_STATUS    200;
}

#------------------------------------
# /path/to/nginx/servers/default.conf
server {
        listen       80;
        server_name  mailan.shop www.mailan.shop;
        root         /usr/share/nginx/html/coming/;

        access_log  /var/log/mailan/access.log;
        error_log /var/log/mailan/error.log;

        location / {
                #try_files $uri $uri/ /index.php$is_args$args;
                index  index.html index.php;
        }

#       include   /usr/local/etc/nginx/conf.d/php-fpm.conf;
}
```

7 .编辑 nginx 的 docker-compose 

```yaml
version: '3.0'
services:
  nginx-box:
    image: nginx:latest
    volumes:
    - /home/www:/usr/share/nginx/html
    - /usr/local/etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - /usr/local/etc/nginx/conf.d:/etc/nginx/conf.d:ro
    - /usr/local/etc/nginx/servers:/etc/nginx/servers:ro
    - /home/logs:/var/log
    ports:
    - "80:80"
```

8. 添加 PHP  container支持

   1. build 自己的 PHP镜像，安装 memcached 和 pdo_mysql
   2. 配置 php-fpm.conf 和 php.ini

   ```yaml
     php-box:
       image: php-mysql:latest
       volumes:
       - /home/www:/usr/share/nginx/html
       - /usr/local/etc/php/php.ini:/usr/local/etc/php/php.ini
       - /usr/local/etc/php/php-fpm.conf:/usr/local/etc/php-fpm.conf
       - /usr/local/etc/php/www.pool.conf:/usr/local/etc/php-fpm.d/www.conf
       - /home/logs/php:/usr/local/var/log
       expose:
       - "9000"
   ```


