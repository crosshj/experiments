{
    "targets": [{
        "target_name": "nativeChop",
        "sources": ["nativeChop.cpp"],
        "include_dirs" : ["<!(node -e \"require('nan')\")"]
    }]
}
