{
    "targets": [{
        "target_name": "nativeChop",
        "sources": [
            "nativeChop.cpp",
            "source/picture.cpp",
            "source/block.cpp",
            "source/pixel.cpp"
        ],
        "include_dirs" : [
            "<!(node -e \"require('nan')\")",
            "headers"
        ]
    }]
}
