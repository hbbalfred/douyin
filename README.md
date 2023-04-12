# 芜湖

关于新版`ytdl-core`报错修复
https://stackoverflow.com/questions/75959840/syntaxerror-missing-catch-or-finally-after-try-with-ytdl-core

· 下载油管单个视频
```
$ ./ytdl.sh <video_link> [-o -q -f]

-o 保存路径（默认: 当前目录）
    如果是目录，视频会下载到该目录中，视频的文件名就是视频标题
    如果是文件，则会提问是否覆盖该文件，如果加了 -f 参数，则不提问直接覆盖
    如果路径不存在，则当做文件路径
-q 视频质量（默认: 18) 有效格式见：https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options
-f 强制保存
```

· 下载油管播放列表
```
$ ./ytdl-plst.sh <playlist_link> [-o -q --auto-idx --start-idx --end-idx]

-o 参考单个视频
-q 参考单个视频
--auto-idx 每个文件是否增加前缀索引（默认: true)
--start-idx 从第几个索引开始下载，第一个索引是1（默认: 1)
--end-idx 下载到第几个索引为止（默认: 最后一个）
```

· 剥离视频中的音频
```
$ ./conv.sh <work_dir> [src_ext dst_ext]

参数1 工作目录
参数2 工作目录中被操作文件的后缀名（默认：mp4)
参数3 导出音频文件的后缀名（默认：m4a)
```

· 合成视频
```
$ ./vid-syn.sh <work_dir> [tmp_dir final_video]

参数1 工作目录
参数2 合成中生产文件的临时目录（默认：当前目录）
参数3 最终导出的文件名（默认: final.mp4)
```

· 解析视频时长
```
$ ./plst-tim.sh <work_dir>

参数1 工作目录
```
