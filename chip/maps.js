const maps = [

    // level 0 (does not exist)
    [],

    // level 1
    [
        [ "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "CHIP_", "     ", "WALL_", "END__", "WALL_", "     ", "CHIP_", "     ", "WALL_", "     ", "     " ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "LOCKG", "WALL_", "SOCK_", "WALL_", "LOCKG", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "     ", "KEYY1", "     ", "LOCKC", "     ", "     ", "     ", "     ", "     ", "LOCKR", "     ", "KEYY1", "     ", "WALL_" ],
        [ "WALL_", "     ", "CHIP_", "     ", "WALL_", "KEYC1", "     ", "HELP_", "     ", "KEYR1", "WALL_", "     ", "CHIP_", "     ", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "CHIP_", "     ", "     ", "     ", "CHIP_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "     ", "CHIP_", "     ", "WALL_", "KEYC1", "     ", "START", "     ", "KEYR1", "WALL_", "     ", "CHIP_", "     ", "WALL_" ],
        [ "WALL_", "     ", "     ", "     ", "LOCKR", "     ", "     ", "CHIP_", "     ", "     ", "LOCKC", "     ", "     ", "     ", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "LOCKY", "WALL_", "LOCKY", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "CHIP_", "WALL_", "CHIP_", "     ", "WALL_", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "KEYG2", "     ", "WALL_", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     " ]
    ],

    // level 2
    [
        [ "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "CHIP_", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     " ],
        [ "WALL_", "WALL_", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "     ", "WATER", "WATER", "     ", "     ", "     ", "     ", "     ", "CHIP_", "WALL_", "     " ],
        [ "WALL_", "END__", "SOCK_", "     ", "     ", "WALL_", "WALL_", "     ", "     ", "WATER", "WATER", "     ", "BLOCK", "BLOCK", "START", "HELP_", "     ", "WALL_", "     " ],
        [ "WALL_", "WALL_", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "     ", "WATER", "WATER", "     ", "     ", "     ", "     ", "     ", "CHIP_", "WALL_", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "CHIP_", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ]
    ],

    // level 3
    [
        [ "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "END__", "WALL_", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "SOCK_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "WALL_", "PUSHD", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "WALL_", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "WALL_", "PUSHD", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_", "     ", "     ", "     " ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "PUSHD", "WALL_", "WATER", "WATER", "WATER", "WATER", "WALL_", "PUSHU", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "PUSHD", "PUSHL", "PUSHL", "PUSHL", "WALL_", "WATER", "SKATE", "CHIP_", "WATER", "WALL_", "PUSHU", "PUSHL", "PUSHL", "PUSHL", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "WALL_", "WALL_", "WALL_", "WATER", "WATER", "WATER", "WATER", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "ICEUL", "ICE__", "ICE__", "     ", "     ", "     ", "     ", "FIRE_", "FIRE_", "FIRE_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "ICE__", "BOOTR", "WALL_", "     ", "     ", "     ", "     ", "FIRE_", "BOOTG", "FIRE_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "ICE__", "CHIP_", "WALL_", "     ", "START", "HELP_", "     ", "FIRE_", "CHIP_", "FIRE_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "ICELL", "ICE__", "ICE__", "     ", "     ", "FLIP_", "     ", "FIRE_", "FIRE_", "FIRE_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHD", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHR", "PUSHR", "PUSHR", "PUSHR", "PUSHR", "PUSHU", "PUSHU", "PUSHU", "PUSHR", "PUSHR", "PUSHR", "PUSHR", "PUSHR", "PUSHU", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "CHIP_", "PUSHU", "PUSHU", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "     ", "WALL_", "PUSHU", "PUSHU", "PUSHU", "PUSHU", "WALL_", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     " ]
    ],

    // level 4
    [
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "CHIP_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "BTNBL", "     ", "WALL_", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "BRDRE", "     ", "     ", "WALL_" ],
        [ "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "SOCK_", "WALL_", "WALL_", "END__", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "CHIP_", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "BTNBL", "WALL_", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "BTNGR", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "     ", "START", "     ", "WALL_", "     ", "     ", "BRDRF", "     ", "     ", "WALL_", "     ", "     ", "WALL_" ],
        [ "WALL_", "BTNBL", "     ", "WALL_", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "HELP_", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "BRDRF", "     ", "CHIP_", "WALL_" ],
        [ "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "BTNGR", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "BRDRF", "     ", "CHIP_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "BRDRE", "     ", "     ", "WALL_", "     ", "     ", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "BK_CP", "     ", "BK_CP", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "BTNGR", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "BK_FR", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "CHIP_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "BK_CP", "     ", "BK_CP", "     ", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "BRDRE", "     ", "     ", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     " ]
    ],

    // level 5
    [
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     " ],
        [ "WALL_", "END__", "BOMB_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "     ", "     " ],
        [ "WALL_", "WALL_", "WALL_", "     ", "     ", "BOMB_", "BOMB_", "BOMB_", "     ", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "BTNBR", "BOMB_", "CIRBR", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "BOMB_", "BOMB_", "BOMB_", "     ", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "BOMB_", "BOMB_", "BOMB_", "     ", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "BTNBR", "BOMB_", "CIRBR", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "     ", "     ", "BOMB_", "BOMB_", "BOMB_", "     ", "     ", "WALL_", "     ", "     " ],
        [ "     ", "     ", "WALL_", "WALL_", "LOCKR", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "BTNGR", "     ", "     ", "     ", "     ", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "WALL_", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "BRDRF", "     ", "BTNRE", "     ", "WALL_", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "WATER", "KEYR1", "FIRE_", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "WATER", "     ", "FIRE_", "     ", "     ", "CLMCL", "     ", "HELP_", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "WATER", "     ", "FIRE_", "     ", "     ", "     ", "     ", "START", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_" ],
        [ "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ]
    ],

    // level 6
    [
        [ "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW" ],
        [ "BLUEW", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "BLUEW" ],
        [ "BLUEW", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "     ", "BLUEW" ],
        [ "BLUEW", "BLUEW", "FAKEW", "BLUEW", "BLUEW", "FAKEW", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "FAKEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW" ],
        [ "BLUEW", "CHIP_", "     ", "HIDEW", "     ", "     ", "BLUEW", "     ", "     ", "     ", "BLUEW", "     ", "     ", "SHOWW", "     ", "CHIP_", "BLUEW" ],
        [ "BLUEW", "CHIP_", "     ", "HIDEW", "     ", "     ", "BLUEW", "     ", "HELP_", "     ", "FAKEW", "     ", "     ", "SHOWW", "     ", "CHIP_", "BLUEW" ],
        [ "BLUEW", "CHIP_", "     ", "HIDEW", "     ", "     ", "FAKEW", "     ", "START", "     ", "BLUEW", "     ", "     ", "SHOWW", "     ", "CHIP_", "BLUEW" ],
        [ "BLUEW", "CHIP_", "     ", "HIDEW", "     ", "     ", "BLUEW", "     ", "     ", "     ", "BLUEW", "     ", "     ", "SHOWW", "     ", "CHIP_", "BLUEW" ],
        [ "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "WALL_", "WALL_", "SOCK_", "WALL_", "WALL_", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW", "BLUEW" ],
        [ "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "END__", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     " ],
        [ "     ", "     ", "     ", "     ", "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "     ", "     ", "     ", "     ", "     ", "     ", "     " ]
    ],

    // level 7
    [
        [ "     ", "     ", "     ", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_" ],
        [ "     ", "     ", "     ", "WALL_", "PUSHD", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "WALL_" ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "PUSHD", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHR", "CHIP_", "PUSHR", "PUSHD", "CHIP_", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "PUSHL", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "WALL_", "THIEF", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "CIRGY", "     ", "FIRE_", "PUSHU", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "     ", "START", "HELP_", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "FIRE_", "PUSHU", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "     ", "     ", "     ", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "FIRE_", "PUSHU", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "     ", "     ", "     ", "CIRCY", "WALL_", "CIRCY", "     ", "WALL_", "     ", "FIRE_", "PUSHU", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WATER", "     ", "WALL_", "     ", "CIRCY", "WALL_", "CIRCY", "     ", "     ", "     ", "WALL_", "PUSHR", "PUSHR", "PUSHU", "WALL_" ],
        [ "WALL_", "PUSHU", "WATER", "     ", "WALL_", "     ", "     ", "WALL_", "     ", "     ", "SOCK_", "END__", "WALL_", "PUSHU", "WALL_", "WALL_", "WALL_" ],
        [ "WALL_", "PUSHU", "WATER", "     ", "WALL_", "     ", "BOOTR", "WALL_", "THIEF", "WALL_", "WALL_", "WALL_", "WALL_", "PUSHU", "WALL_", "     ", "     " ],
        [ "WALL_", "PUSHU", "WATER", "     ", "CIRGY", "     ", "     ", "WALL_", "     ", "     ", "     ", "CHIP_", "     ", "PUSHU", "WALL_", "     ", "     " ],
        [ "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "WALL_", "     ", "     " ]
    ],

    // blank level
    [
        [ "     ", "     ", "     " ],
        [ "     ", "START", "     " ],
        [ "     ", "     ", "     " ]
    ]
];
