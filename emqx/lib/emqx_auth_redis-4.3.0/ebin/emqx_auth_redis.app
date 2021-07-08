{application,emqx_auth_redis,
             [{description,"EMQ X Authentication/ACL with Redis"},
              {vsn,"4.3.0"},
              {modules,[emqx_acl_redis,emqx_auth_redis,emqx_auth_redis_app,
                        emqx_auth_redis_cli,emqx_auth_redis_sup]},
              {registered,[emqx_auth_redis_sup]},
              {applications,[kernel,stdlib,eredis,eredis_cluster,ecpool]},
              {mod,{emqx_auth_redis_app,[]}},
              {env,[]},
              {licenses,["Apache-2.0"]},
              {maintainers,["EMQ X Team <contact@emqx.io>"]},
              {links,[{"Homepage","https://emqx.io/"},
                      {"Github","https://github.com/emqx/emqx-auth-redis"}]},
              {relup_deps,[emqx]}]}.