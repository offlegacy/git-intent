{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";

  outputs =
    inputs:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs {
              inherit system;
              overlays = [ inputs.self.overlays.default ];
            };
          }
        );
    in
    {
      overlays.default =
        final: prev:
        let
          packageJson =
            if builtins.pathExists ./package.json then
              builtins.fromJSON (builtins.readFile ./package.json)
            else
              { };
          packageManagerSpec = packageJson.packageManager or "pnpm@latest";

          parsePnpmVersion =
            spec:
            let
              matchResult = builtins.match "pnpm@(.*)" spec;
            in
            if matchResult != null then builtins.head matchResult else null;

          pnpmVersion = parsePnpmVersion packageManagerSpec;
        in
        rec {
          nodejs = prev.nodejs;
          yarn = (prev.yarn.override { inherit nodejs; });

          pnpm =
            if pnpmVersion != null then
              prev.pnpm.overrideAttrs (old: rec {
                version = pnpmVersion;
                src = prev.fetchurl {
                  url = "https://registry.npmjs.org/pnpm/-/pnpm-${version}.tgz";
                  hash = "sha256-hHIWjD4f0L/yh+aUsFP8y78gV5o/+VJrYzO+q432Wo0=";
                };
              })
            else
              prev.pnpm;
        };

      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              node2nix
              nodejs
              pnpm
              yarn
            ];
          };
        }
      );
    };
}
